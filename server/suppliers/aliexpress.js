/**
 * AliExpress supplier adapter.
 *
 * Uses the AliExpress Open Platform API (affiliate / dropshipping endpoints).
 * Docs: https://developers.aliexpress.com/en/doc.htm
 *
 * Required env vars:
 *   ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET, ALIEXPRESS_ACCESS_TOKEN
 *
 * All public methods return normalised objects so that the rest of the
 * application never has to know the shape of AliExpress API responses.
 */

const crypto = require('crypto');

const BASE_URL = 'https://api-sg.aliexpress.com/rest';

// ─── Low-level HTTP helper ─────────────────────────────────────────────────

/**
 * Build a signed AliExpress API request and return the parsed body.
 * @param {string} method   - AliExpress API method name
 * @param {object} params   - Additional query/body parameters
 */
async function callAliExpressAPI(method, params = {}) {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;
  const accessToken = process.env.ALIEXPRESS_ACCESS_TOKEN;

  if (!appKey || !appSecret || !accessToken) {
    throw new Error('AliExpress credentials not configured');
  }

  const timestamp = Date.now().toString();
  const signParams = {
    app_key: appKey,
    access_token: accessToken,
    timestamp,
    sign_method: 'sha256',
    method,
    ...params,
  };

  // Compute HMAC-SHA256 signature
  const sortedKeys = Object.keys(signParams).sort();
  const paramStr = sortedKeys.map((k) => `${k}${signParams[k]}`).join('');
  const sign = crypto
    .createHmac('sha256', appSecret)
    .update(paramStr)
    .digest('hex')
    .toUpperCase();

  const url = new URL(BASE_URL);
  Object.entries({ ...signParams, sign }).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  );

  const response = await fetch(url.toString(), { method: 'POST' });
  if (!response.ok) {
    throw new Error(`AliExpress HTTP error: ${response.status}`);
  }

  const body = await response.json();

  // AliExpress wraps responses in a method-specific key
  const resultKey = Object.keys(body).find((k) => k !== 'request_id');
  const result = resultKey ? body[resultKey] : body;

  if (result && result.result_code && result.result_code !== '200') {
    throw new Error(`AliExpress API error: ${result.error_msg || result.result_code}`);
  }

  return result;
}

// ─── Retry wrapper ─────────────────────────────────────────────────────────

async function withRetry(fn, retries = 3, delayMs = 1000) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
      }
    }
  }
  throw lastErr;
}

// ─── Normalizers ────────────────────────────────────────────────────────────

function normalizeProduct(raw) {
  return {
    supplierProductId: String(raw.product_id || raw.productId || ''),
    name: raw.product_title || raw.name || '',
    description: raw.product_detail || raw.description || '',
    image: raw.image_url || raw.imageUrl || '',
    images: raw.image_urls
      ? raw.image_urls.split(';').filter(Boolean)
      : raw.image_url
      ? [raw.image_url]
      : [],
    cost: parseFloat(raw.target_sale_price || raw.sale_price || raw.price || 0),
    currency: raw.target_sale_price_currency || raw.currency || 'USD',
    shippingProfile: raw.ship_from_country === 'CN' ? 'ePacket' : 'Standard',
    processingDays: parseInt(raw.processing_time || '3', 10),
    url: raw.product_detail_url || '',
    stockAvailable: raw.product_id ? true : false,
  };
}

function normalizeOrder(raw) {
  return {
    supplierOrderId: String(raw.order_id || raw.orderId || ''),
    status: raw.order_status || 'PLACE_ORDER_SUCCESS',
  };
}

function normalizeTracking(raw) {
  return {
    trackingNumber: raw.tracking_number || raw.logistics_no || '',
    carrier: raw.logistics_company || raw.carrier || '',
    status: raw.logistics_status || '',
    trackingUrl: raw.logistics_tracking_url || '',
  };
}

// ─── Public adapter methods ─────────────────────────────────────────────────

/**
 * Search for products by keyword.
 * @param {string} keyword
 * @param {object} options  - { page, pageSize }
 */
async function searchProducts(keyword, { page = 1, pageSize = 20 } = {}) {
  return withRetry(async () => {
    const result = await callAliExpressAPI(
      'aliexpress.affiliate.product.query',
      {
        keywords: keyword,
        page_no: page,
        page_size: pageSize,
        target_currency: process.env.SUPPLIER_CURRENCY || 'USD',
        target_language: process.env.SUPPLIER_LOCALE || 'EN',
        ship_to_country: process.env.SUPPLIER_SHIP_TO_COUNTRY || 'US',
        fields: 'product_id,product_title,image_url,target_sale_price,target_sale_price_currency,product_detail_url',
      }
    );

    const products = result?.resp_result?.result?.products?.product || [];
    return products.map(normalizeProduct);
  });
}

/**
 * Fetch details for a single AliExpress product by its product ID.
 * @param {string} supplierProductId
 */
async function getProduct(supplierProductId) {
  return withRetry(async () => {
    const result = await callAliExpressAPI(
      'aliexpress.affiliate.productdetail.get',
      {
        product_ids: supplierProductId,
        target_currency: process.env.SUPPLIER_CURRENCY || 'USD',
        target_language: process.env.SUPPLIER_LOCALE || 'EN',
        ship_to_country: process.env.SUPPLIER_SHIP_TO_COUNTRY || 'US',
        fields: 'product_id,product_title,image_url,image_urls,target_sale_price,target_sale_price_currency,product_detail,product_detail_url,processing_time,ship_from_country',
      }
    );

    const products = result?.resp_result?.result?.products?.product || [];
    if (products.length === 0) throw new Error(`Product ${supplierProductId} not found`);
    return normalizeProduct(products[0]);
  });
}

/**
 * Check current price and stock status for a product.
 * Returns { cost, stockAvailable }
 * @param {string} supplierProductId
 */
async function checkPriceAndStock(supplierProductId) {
  const product = await getProduct(supplierProductId);
  return {
    cost: product.cost,
    stockAvailable: product.stockAvailable,
  };
}

/**
 * Place an order with AliExpress on behalf of a customer.
 *
 * @param {object} orderData
 * @param {Array}  orderData.items              - [{ supplierProductId, supplierSkuId, quantity }]
 * @param {object} orderData.shippingAddress    - { name, line1, city, state, zip, country, phone }
 * @param {string} orderData.logisticsService   - e.g. 'CAINIAO_STANDARD' (default)
 */
async function placeOrder({ items, shippingAddress, logisticsService = 'CAINIAO_STANDARD' }) {
  return withRetry(async () => {
    // Build product list in AliExpress format
    const productItems = items.map((item) => ({
      product_id: item.supplierProductId,
      product_count: item.quantity,
      sku_attr: item.supplierSkuId || '',
      logistics_service_name: logisticsService,
    }));

    const address = {
      contact_person: shippingAddress.name,
      full_name: shippingAddress.name,
      address: shippingAddress.line1,
      city: shippingAddress.city,
      province: shippingAddress.state || '',
      zip: shippingAddress.zip || '',
      country: shippingAddress.country || 'US',
      mobile_no: shippingAddress.phone || '',
    };

    const result = await callAliExpressAPI('aliexpress.trade.order.create', {
      param_place_order_request4_open_api_d_t_o: JSON.stringify({
        product_items: productItems,
        logistics_address: address,
      }),
    });

    const orderResult = result?.result || result;
    if (!orderResult || !orderResult.order_id) {
      throw new Error('AliExpress did not return an order ID');
    }
    return normalizeOrder(orderResult);
  });
}

/**
 * Get tracking information for a supplier order.
 * @param {string} supplierOrderId
 */
async function getTracking(supplierOrderId) {
  return withRetry(async () => {
    const result = await callAliExpressAPI('aliexpress.logistics.buyer.freight.get', {
      order_id: supplierOrderId,
    });

    const tracking = result?.result?.logistics_info || {};
    return normalizeTracking(tracking);
  });
}

module.exports = {
  searchProducts,
  getProduct,
  checkPriceAndStock,
  placeOrder,
  getTracking,
};