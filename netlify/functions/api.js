// Metro Wholesale — Mock API + Real Daraja M-Pesa Integration
'use strict';

const https = require('https');

// ─── Daraja Config ───────────────────────────────────────────────────────────
const MPESA_CONSUMER_KEY    = process.env.MPESA_CONSUMER_KEY    || 'raistC8nDSfCiyVXZgRGuDuqwc1dGDfLBUtIgjtnlSakj9Rr';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'xxFsvBr4SuKHYV0MvSfQxuyEoU9fSUIOjoYpuSbAuxtp6IUXvONTNUuamGLV9pYZ';
const MPESA_SHORTCODE       = process.env.MPESA_SHORTCODE       || '174379';
const MPESA_PASSKEY         = process.env.MPESA_PASSKEY         || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const MPESA_ENV             = process.env.MPESA_ENV             || 'sandbox';
const DARAJA_BASE           = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';
const CALLBACK_URL = 'https://fazul-97wholesale.netlify.app/api/mpesa/callback';

// ─── Daraja helpers ──────────────────────────────────────────────────────────
function darajaRequest(path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const url  = new URL(DARAJA_BASE + path);
    const opts = { hostname: url.hostname, path: url.pathname + url.search, method, headers };
    const req  = https.request(opts, res => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end',  () => { try { resolve(JSON.parse(raw)); } catch (_) { resolve(raw); } });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function getMpesaToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const data = await darajaRequest(
    '/oauth/v1/generate?grant_type=client_credentials',
    'GET',
    { Authorization: `Basic ${auth}` }
  );
  return data.access_token;
}

function mpesaTimestamp() {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

function mpesaPassword(ts) {
  return Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${ts}`).toString('base64');
}

function formatPhone(phone) {
  return String(phone).replace(/^\+/, '').replace(/^0/, '254');
}

// ─── Mock data ───────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id:'p1', name:'Unga Pembe 2kg',   sku:'UNGA-2KG',   unit:'bag',    price:180, salePrice:165, stockStatus:'IN_STOCK',    category:'Flour & Grains', imageUrl:null },
  { id:'p2', name:'Cooking Oil 5L',   sku:'OIL-5L',     unit:'bottle', price:920, salePrice:null,stockStatus:'IN_STOCK',    category:'Oils & Fats',    imageUrl:null },
  { id:'p3', name:'Maize Flour 2kg',  sku:'MAIZE-2KG',  unit:'bag',    price:120, salePrice:null,stockStatus:'LIMITED',     category:'Flour & Grains', imageUrl:null },
  { id:'p4', name:'Sugar 1kg',        sku:'SUGAR-1KG',  unit:'pack',   price:160, salePrice:150, stockStatus:'IN_STOCK',    category:'Household',      imageUrl:null },
  { id:'p5', name:'Milk 500ml',       sku:'MILK-500ML', unit:'packet', price:55,  salePrice:null,stockStatus:'IN_STOCK',    category:'Dairy',          imageUrl:null },
  { id:'p6', name:'Omo 1kg',          sku:'OMO-1KG',    unit:'pack',   price:340, salePrice:null,stockStatus:'IN_STOCK',    category:'Cleaning',       imageUrl:null },
  { id:'p7', name:'Soda Water 6pack', sku:'SODA-6PK',   unit:'pack',   price:420, salePrice:399, stockStatus:'IN_STOCK',    category:'Beverages',      imageUrl:null },
  { id:'p8', name:'Bread Sliced',     sku:'BREAD-SL',   unit:'loaf',   price:65,  salePrice:null,stockStatus:'OUT_OF_STOCK',category:'Household',      imageUrl:null },
];

const ORDERS = [
  {
    id:'o1', orderNumber:'MW-00001', status:'DELIVERED', total:2340, subtotal:2340,
    discountAmount:0, loyaltyDiscount:0, loyaltyPointsEarned:234,
    createdAt:new Date(Date.now()-86400000*3).toISOString(),
    updatedAt:new Date().toISOString(), note:null, discountCode:null,
    customer:{name:'John Kamau',phone:'+254711000001',loyaltyPoints:450},
    address:{label:'Home',line1:'123 Ngong Road',city:'Nairobi'},
    items:[
      {id:'oi1',product:{id:'p1',name:'Unga Pembe 2kg',unit:'bag',price:180,salePrice:165,stockStatus:'IN_STOCK',imageUrl:null},requestedQty:5,confirmedQty:5,price:180},
      {id:'oi2',product:{id:'p2',name:'Cooking Oil 5L',unit:'bottle',price:920,salePrice:null,stockStatus:'IN_STOCK',imageUrl:null},requestedQty:2,confirmedQty:2,price:920}
    ]
  },
  {
    id:'o2', orderNumber:'MW-00002', status:'PENDING', total:1580, subtotal:1580,
    discountAmount:0, loyaltyDiscount:0, loyaltyPointsEarned:0,
    createdAt:new Date(Date.now()-3600000).toISOString(),
    updatedAt:new Date().toISOString(), note:'Please deliver in the morning', discountCode:null,
    customer:{name:'Mary Wanjiru',phone:'+254722000002',loyaltyPoints:0},
    address:{label:'Office',line1:'Westlands Business Park',city:'Nairobi'},
    items:[
      {id:'oi3',product:{id:'p4',name:'Sugar 1kg',unit:'pack',price:150,salePrice:150,stockStatus:'IN_STOCK',imageUrl:null},requestedQty:4,confirmedQty:null,price:150},
      {id:'oi4',product:{id:'p5',name:'Milk 500ml',unit:'packet',price:55,salePrice:null,stockStatus:'IN_STOCK',imageUrl:null},requestedQty:12,confirmedQty:null,price:55}
    ]
  },
  {
    id:'o3', orderNumber:'MW-00003', status:'MODIFIED', total:940, subtotal:1000,
    discountAmount:0, loyaltyDiscount:0, loyaltyPointsEarned:0,
    createdAt:new Date(Date.now()-7200000).toISOString(),
    updatedAt:new Date().toISOString(), note:null, discountCode:null,
    customer:{name:'Peter Omondi',phone:'+254733000003',loyaltyPoints:120},
    address:{label:'Home',line1:'45 Kiambu Road',city:'Kiambu'},
    items:[
      {id:'oi5',product:{id:'p6',name:'Omo 1kg',unit:'pack',price:340,salePrice:null,stockStatus:'IN_STOCK',imageUrl:null},requestedQty:3,confirmedQty:2,price:340},
      {id:'oi6',product:{id:'p7',name:'Soda Water 6pack',unit:'pack',price:399,salePrice:399,stockStatus:'IN_STOCK',imageUrl:null},requestedQty:1,confirmedQty:1,price:399}
    ]
  },
];

const DISCOUNTS = [
  { id:'d1', code:'WELCOME10', description:'10% off your first order',      discountType:'PERCENTAGE', discountValue:10,  minOrderAmount:1000, maxUsage:100, usageCount:23, isActive:true,  expiresAt:null },
  { id:'d2', code:'SAVE200',   description:'KES 200 off orders above 2000', discountType:'FIXED',      discountValue:200, minOrderAmount:2000, maxUsage:50,  usageCount:8,  isActive:true,  expiresAt:'2026-12-31' },
  { id:'d3', code:'SUMMER15',  description:'Summer special 15% off',         discountType:'PERCENTAGE', discountValue:15,  minOrderAmount:500,  maxUsage:30,  usageCount:30, isActive:false, expiresAt:'2026-03-31' },
];

const MOCK_TOKEN          = 'mock_access_token_store_owner';
const MOCK_CASHIER_TOKEN  = 'mock_access_token_cashier';
const MOCK_DRIVER_TOKEN   = 'mock_access_token_driver';
const MOCK_CUSTOMER_TOKEN = 'mock_access_token_customer';

const STORE_USERS = [
  { email:'owner@metrowholesale.co.ke',   password:'store1234', id:'owner1',   role:'STORE_OWNER', name:'Grace Wanjiku', token:MOCK_TOKEN },
  { email:'cashier@metrowholesale.co.ke', password:'cash1234',  id:'cashier1', role:'CASHIER',     name:'Jane Cashier',  token:MOCK_CASHIER_TOKEN },
  { email:'driver@metrowholesale.co.ke',  password:'drive1234', id:'driver1',  role:'DRIVER',      name:'Tom Driver',    token:MOCK_DRIVER_TOKEN },
];

const PENDING_REGISTRATIONS = {};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

function ok(data)       { return { statusCode:200, headers:CORS_HEADERS, body:JSON.stringify({ success:true, data }) }; }
function err(msg, code) { return { statusCode:code||400, headers:CORS_HEADERS, body:JSON.stringify({ success:false, message:msg }) }; }
function raw(data)      { return { statusCode:200, headers:CORS_HEADERS, body:JSON.stringify(data) }; }

// ─── Static routes ───────────────────────────────────────────────────────────
function routeStatic(method, path, body) {
  const key = method + ' ' + path;
  switch (key) {

    case 'POST /api/auth/store/login': {
      const u = STORE_USERS.find(x => x.email === body.email && x.password === body.password);
      if (u) return ok({ user:{ id:u.id, role:u.role, email:u.email, name:u.name }, accessToken:u.token, refreshToken:'refresh_mock' });
      return err('Invalid credentials', 401);
    }
    case 'POST /api/auth/register': {
      const regPhone = body.phone || '';
      PENDING_REGISTRATIONS[regPhone] = { name:body.name||'New Customer', businessName:body.businessName||'' };
      return raw({ success:true, message:'OTP sent! Use code: 123456 for demo' });
    }
    case 'POST /api/auth/request-otp':
      return raw({ success:true, message:'OTP sent! Use code: 123456 for demo' });
    case 'POST /api/auth/verify-otp': {
      const phone    = body.phone || '+254711000001';
      const pending  = PENDING_REGISTRATIONS[phone];
      const userName = body.name || (pending && pending.name) || 'Demo Customer';
      const bizName  = body.businessName || (pending && pending.businessName) || '';
      if (pending) delete PENDING_REGISTRATIONS[phone];
      return ok({ user:{ id:'cust_'+Date.now(), role:'CUSTOMER', phone, name:userName, businessName:bizName }, accessToken:MOCK_CUSTOMER_TOKEN, refreshToken:'refresh_mock' });
    }
    case 'POST /api/auth/refresh': return ok({ accessToken:MOCK_TOKEN, refreshToken:'refresh_mock' });
    case 'POST /api/auth/logout':  return raw({ success:true });

    case 'GET /api/products':
    case 'GET /api/products/store/all':
      return raw({ success:true, data:PRODUCTS, total:PRODUCTS.length });
    case 'POST /api/products': {
      const p = { id:'p_new', ...body };
      PRODUCTS.push(p);
      return ok(p);
    }

    case 'GET /api/customers/me':
      return ok({ id:'cust1', name:'Demo Customer', phone:'+254711000001', loyaltyPoints:450 });
    case 'GET /api/customers/me/addresses':
      return ok([{ id:'addr1', label:'Home', line1:'123 Ngong Road', city:'Nairobi', isDefault:true }]);
    case 'PUT /api/customers/me':
      return ok({ id:'cust1', name:body.name||'Customer', phone:'+254711000001', loyaltyPoints:450 });
    case 'POST /api/customers/me/addresses':
      return ok({ id:'addr_new', ...body, isDefault:false });
    case 'GET /api/customers/me/frequent':    return ok(PRODUCTS.slice(0,4));
    case 'GET /api/customers/me/recommended': return ok(PRODUCTS.slice(0,3));

    case 'GET /api/orders':      return raw({ success:true, data:ORDERS, total:ORDERS.length });
    case 'GET /api/orders/last': return ok(ORDERS[0]);
    case 'POST /api/orders': {
      const calc = (items) => items
        ? items.reduce((s,i) => { const p=PRODUCTS.find(x=>x.id===i.productId); return s+(p?(p.salePrice||p.price)*i.quantity:0); }, 0)
        : 999;
      const newOrder = {
        id:'o_'+Date.now(),
        orderNumber:'MW-'+String(100+ORDERS.length).padStart(5,'0'),
        status:'PENDING', total:calc(body.items), subtotal:calc(body.items),
        discountAmount:0, loyaltyDiscount:0, loyaltyPointsEarned:0,
        paymentMethod:body.paymentMethod||'MPESA',
        createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
        note:body.note||null, discountCode:body.discountCode||null,
        customer:{ name:'Demo Customer', phone:'+254711000001', loyaltyPoints:450 },
        address:{ label:'Home', line1:'123 Ngong Road', city:'Nairobi' },
        items: body.items ? body.items.map((i,idx) => {
          const p=PRODUCTS.find(x=>x.id===i.productId)||PRODUCTS[0];
          return { id:'oi_'+Date.now()+idx, product:p, requestedQty:i.quantity, confirmedQty:null, price:p.salePrice||p.price };
        }) : [],
      };
      ORDERS.unshift(newOrder);
      return ok(newOrder);
    }
    case 'POST /api/orders/validate-discount': {
      const d = DISCOUNTS.find(x => x.code===body.code && x.isActive);
      if (d) {
        const amt = d.discountType==='PERCENTAGE' ? Math.floor(body.orderTotal*d.discountValue/100) : d.discountValue;
        return ok({ valid:true, discountAmount:amt, message:d.code+' applied!' });
      }
      return ok({ valid:false, discountAmount:0, message:'Invalid or expired code' });
    }
    case 'GET /api/orders/store/all': {
      const totals = ORDERS.reduce((acc,o) => { acc[o.status]=(acc[o.status]||0)+1; return acc; }, {});
      return raw({ success:true, data:ORDERS, total:ORDERS.length, pages:1, totals });
    }

    case 'GET /api/store/discounts': return ok(DISCOUNTS);
    case 'POST /api/store/discounts': {
      const d = { id:'d_new', ...body, usageCount:0, isActive:true };
      DISCOUNTS.push(d);
      return ok(d);
    }
    case 'GET /api/store/loyalty/config': return ok({ loyaltyEarnRate:1, loyaltyRedeemValue:0.01 });
    case 'PUT /api/store/loyalty/config':  return ok(body);

    case 'GET /api/store/analytics':
      return ok({
        summary:{ totalRevenue:284600, totalOrders:47, totalCustomers:18, avgOrderValue:6055 },
        revenueByDay:[
          {date:'Mar 13',revenue:27600},{date:'Mar 14',revenue:19900},{date:'Mar 15',revenue:24800},
          {date:'Mar 16',revenue:31200},{date:'Mar 17',revenue:15800},{date:'Mar 18',revenue:22100},{date:'Mar 19',revenue:18400}
        ],
        topProducts:[
          {name:'Cooking Oil 5L',units:84,revenue:77280},{name:'Unga Pembe 2kg',units:210,revenue:34650},
          {name:'Sugar 1kg',units:180,revenue:27000},{name:'Soda Water 6pk',units:66,revenue:26334},{name:'Omo 1kg',units:72,revenue:24480}
        ],
        ordersByStatus:[
          {status:'DELIVERED',count:28},{status:'PENDING',count:9},{status:'MODIFIED',count:6},{status:'DISPATCHED',count:4}
        ],
        topCustomers:[
          {name:'John Kamau',orders:8,spent:52400},{name:'Mary Wanjiru',orders:6,spent:38900},{name:'Peter Omondi',orders:5,spent:31200}
        ]
      });

    case 'GET /api/store/finance':
      return ok({
        summary:{ totalCollected:198400, pendingPayment:62800, overdue:23400, thisMonth:284600 },
        paymentMethods:[{method:'M-Pesa',amount:142000,count:31},{method:'Cash',amount:56400,count:16}],
        recentTransactions:[
          {id:'t1',orderNumber:'MW-00001',customer:'John Kamau',   amount:2340,method:'M-Pesa',status:'PAID',   date:new Date(Date.now()-86400000*2).toISOString()},
          {id:'t2',orderNumber:'MW-00002',customer:'Mary Wanjiru', amount:1580,method:'Cash',  status:'PENDING',date:new Date(Date.now()-3600000).toISOString()},
          {id:'t3',orderNumber:'MW-00003',customer:'Peter Omondi', amount:940, method:'M-Pesa',status:'PAID',   date:new Date(Date.now()-7200000).toISOString()},
          {id:'t4',orderNumber:'MW-00045',customer:'Alice Njeri',  amount:4200,method:'M-Pesa',status:'PAID',   date:new Date(Date.now()-86400000).toISOString()},
          {id:'t5',orderNumber:'MW-00046',customer:'Brian Mwangi', amount:8750,method:'Cash',  status:'OVERDUE',date:new Date(Date.now()-86400000*5).toISOString()},
          {id:'t6',orderNumber:'MW-00047',customer:'Carol Achieng',amount:3120,method:'M-Pesa',status:'PENDING',date:new Date(Date.now()-1800000).toISOString()}
        ]
      });

    case 'GET /api/store/reconciliation':
      return ok({
        summary:{ deliveredToday:4, paidToday:3, collectedCash:12400, collectedMpesa:28600, outstanding:8750 },
        dailyRecords:[
          {date:'Mar 19',delivered:4,paid:3,cashAmount:6200, mpesaAmount:14300,outstanding:8750},
          {date:'Mar 18',delivered:6,paid:6,cashAmount:9800, mpesaAmount:22400,outstanding:0},
          {date:'Mar 17',delivered:5,paid:4,cashAmount:7600, mpesaAmount:18200,outstanding:4200},
          {date:'Mar 16',delivered:8,paid:8,cashAmount:14200,mpesaAmount:31600,outstanding:0},
          {date:'Mar 15',delivered:3,paid:3,cashAmount:4800, mpesaAmount:11200,outstanding:0},
          {date:'Mar 14',delivered:7,paid:6,cashAmount:11400,mpesaAmount:24800,outstanding:5600},
          {date:'Mar 13',delivered:5,paid:5,cashAmount:8200, mpesaAmount:18400,outstanding:0}
        ],
        outstandingBalances:[
          {customer:'Brian Mwangi', phone:'+254744000005',orders:1,amount:8750,lastOrder:'MW-00046',daysPending:5},
          {customer:'Carol Achieng',phone:'+254755000006',orders:2,amount:4200,lastOrder:'MW-00047',daysPending:1},
          {customer:'David Ouma',   phone:'+254766000007',orders:1,amount:3120,lastOrder:'MW-00040',daysPending:3}
        ]
      });

    case 'GET /api/store/team':
      return ok([
        { id:'tm1', name:'Grace Wanjiku', phone:'+254722000010', email:'owner@metrowholesale.co.ke', role:'STORE_OWNER', isActive:true,  joinedAt:'2024-01-15', lastActive:'Today' },
        { id:'tm2', name:'James Kariuki', phone:'+254733000011', email:'james@metro.co.ke',          role:'CASHIER',     isActive:true,  joinedAt:'2024-03-01', lastActive:'Today' },
        { id:'tm3', name:'Brian Otieno',  phone:'+254744000012', email:null,                         role:'DRIVER',      isActive:true,  joinedAt:'2024-03-10', lastActive:'Yesterday' },
        { id:'tm4', name:'Alice Muthoni', phone:'+254755000013', email:null,                         role:'CASHIER',     isActive:false, joinedAt:'2024-02-20', lastActive:'Mar 10' },
        { id:'tm5', name:'Peter Kamunde', phone:'+254766000014', email:null,                         role:'DRIVER',      isActive:true,  joinedAt:'2024-04-05', lastActive:'Today' }
      ]);
    case 'POST /api/store/team':
      return ok({ id:'tm_'+Date.now(), name:body.name, phone:body.phone, email:body.email||null, role:body.role||'CASHIER', isActive:true, joinedAt:new Date().toISOString().split('T')[0], lastActive:'Just now' });

    // Safaricom posts to this URL after payment completes
    case 'POST /api/mpesa/callback':
      return raw({ ResultCode:0, ResultDesc:'Accepted' });

    default:
      return null;
  }
}

// ─── Dynamic routes ──────────────────────────────────────────────────────────
async function routeDynamic(method, path, body) {
  let m;

  // Real Daraja STK Push ─────────────────────────────────────────────────────
  if (path === '/api/mpesa/stkpush' && method === 'POST') {
    try {
      const token  = await getMpesaToken();
      const ts     = mpesaTimestamp();
      const pwd    = mpesaPassword(ts);
      const phone  = formatPhone(body.phone || '254708374149');
      const amount = Math.max(1, Math.ceil(Number(body.amount) || 1));

      const result = await darajaRequest(
        '/mpesa/stkpush/v1/processrequest',
        'POST',
        { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        {
          BusinessShortCode: MPESA_SHORTCODE,
          Password:          pwd,
          Timestamp:         ts,
          TransactionType:   'CustomerPayBillOnline',
          Amount:            amount,
          PartyA:            phone,
          PartyB:            MPESA_SHORTCODE,
          PhoneNumber:       phone,
          CallBackURL:       CALLBACK_URL,
          AccountReference:  'MetroWholesale',
          TransactionDesc:   `Order ${body.orderId || 'Payment'}`,
        }
      );

      if (result.ResponseCode === '0') {
        return { statusCode:200, headers:CORS_HEADERS, body:JSON.stringify({
          success:true,
          CheckoutRequestID: result.CheckoutRequestID,
          MerchantRequestID: result.MerchantRequestID,
          CustomerMessage:   result.CustomerMessage,
        })};
      }
      return { statusCode:400, headers:CORS_HEADERS, body:JSON.stringify({
        success:false,
        message: result.errorMessage || result.ResponseDescription || 'STK push failed',
      })};
    } catch(e) {
      return { statusCode:500, headers:CORS_HEADERS, body:JSON.stringify({ success:false, message:'Daraja error: '+e.message })};
    }
  }

  // Real Daraja STK Query ────────────────────────────────────────────────────
  if (path === '/api/mpesa/query' && method === 'POST') {
    try {
      const token = await getMpesaToken();
      const ts    = mpesaTimestamp();
      const pwd   = mpesaPassword(ts);

      const result = await darajaRequest(
        '/mpesa/stkpushquery/v1/query',
        'POST',
        { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        {
          BusinessShortCode: MPESA_SHORTCODE,
          Password:          pwd,
          Timestamp:         ts,
          CheckoutRequestID: body.checkoutRequestId,
        }
      );
      return { statusCode:200, headers:CORS_HEADERS, body:JSON.stringify(result) };
    } catch(e) {
      return { statusCode:500, headers:CORS_HEADERS, body:JSON.stringify({ success:false, message:'Query error: '+e.message })};
    }
  }

  // Order routes ─────────────────────────────────────────────────────────────
  m = path.match(/^\/api\/orders\/store\/([^/]+)\/confirm$/);
  if (m && method === 'PUT') {
    const idx   = ORDERS.findIndex(x => x.id === m[1]);
    const order = idx !== -1 ? ORDERS[idx] : ORDERS[1];
    const updatedItems = order.items.map(item => {
      const ci = body.items && body.items.find(i => i.orderItemId === item.id);
      return ci ? { ...item, confirmedQty:ci.confirmedQty } : item;
    });
    const hasModified = updatedItems.some(i => i.confirmedQty !== null && i.confirmedQty !== i.requestedQty);
    const updated = { ...order, items:updatedItems, status:hasModified?'MODIFIED':'CONFIRMED', updatedAt:new Date().toISOString() };
    if (idx !== -1) ORDERS[idx] = updated;
    return ok(updated);
  }

  m = path.match(/^\/api\/orders\/store\/([^/]+)\/status$/);
  if (m && method === 'PUT') {
    const idx = ORDERS.findIndex(x => x.id === m[1]);
    if (idx !== -1) ORDERS[idx] = { ...ORDERS[idx], status:body.status, updatedAt:new Date().toISOString() };
    return ok({ status:body.status });
  }

  m = path.match(/^\/api\/orders\/store\/([^/]+)\/notes$/);
  if (m && method === 'POST') return raw({ success:true });

  m = path.match(/^\/api\/orders\/store\/([^/]+)\/payment$/);
  if (m && method === 'POST') {
    return ok({ id:'TXN'+Date.now(), orderId:m[1], method:body.method||'MPESA', amount:body.amount, status:'PAID', recordedAt:new Date().toISOString() });
  }

  m = path.match(/^\/api\/orders\/store\/([^/]+)$/);
  if (m && method === 'GET') { const o=ORDERS.find(x=>x.id===m[1])||ORDERS[1]; return ok(o); }

  m = path.match(/^\/api\/orders\/([^/]+)$/);
  if (m && method === 'GET') { const o=ORDERS.find(x=>x.id===m[1])||ORDERS[0]; return ok(o); }

  m = path.match(/^\/api\/products\/([^/]+)\/stock$/);
  if (m && method === 'PATCH') return ok({ stockStatus:body.stockStatus });

  m = path.match(/^\/api\/products\/([^/]+)\/image$/);
  if (m && method === 'POST') return ok({ imageUrl:'https://placehold.co/150' });

  m = path.match(/^\/api\/products\/([^/]+)$/);
  if (m && (method==='PUT'||method==='PATCH')) return ok(body);
  if (m && method==='GET') { const p=PRODUCTS.find(x=>x.id===m[1])||PRODUCTS[0]; return ok(p); }

  m = path.match(/^\/api\/store\/team\/([^/]+)$/);
  if (m && method==='PATCH') return ok({ id:m[1], ...body });
  if (m && method==='DELETE') return raw({ success:true });

  m = path.match(/^\/api\/store\/discounts\/([^/]+)$/);
  if (m && method==='PATCH') return ok(body);

  m = path.match(/^\/api\/customers\/me\/addresses\/([^/]+)$/);
  if (m && (method==='PATCH'||method==='DELETE')) return raw({ success:true });

  return null;
}

// ─── Handler ─────────────────────────────────────────────────────────────────
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode:204, headers:CORS_HEADERS, body:'' };
  }

  let path;
  try { path = new URL(event.rawUrl).pathname; } catch(_) { path = event.path||'/'; }

  let body = {};
  try { if (event.body) body = JSON.parse(event.body); } catch(_) {}

  const method = event.httpMethod;
  const result = routeStatic(method, path, body) || await routeDynamic(method, path, body);

  if (!result) {
    return { statusCode:404, headers:CORS_HEADERS, body:JSON.stringify({ success:false, message:'Not found: '+method+' '+path }) };
  }

  return result;
};
