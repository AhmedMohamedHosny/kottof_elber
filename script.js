/* Qotof Elbr - Frontend only */
(() => {
  const KEY = 'qotof_elbr_store_v1';
  const CART = 'qotof_elbr_cart';
  const defaultData = {
    settings:{wa:'201000000000',vodafone:'01000000000',freeShipping:1500,primary:'#c88719',secondary:'#5f3b12'},
    shipping:{'القاهرة':60,'الجيزة':60,'القليوبية':70,'الإسكندرية':80,'الدقهلية':85,'البحيرة':85,'الغربية':85,'المنوفية':85,'كفر الشيخ':90,'دمياط':90,'الشرقية':80,'الإسماعيلية':90,'بورسعيد':90,'السويس':90,'شمال سيناء':120,'جنوب سيناء':150,'الفيوم':90,'بني سويف':95,'المنيا':105,'أسيوط':110,'سوهاج':120,'قنا':130,'الأقصر':140,'أسوان':150,'الوادي الجديد':160,'البحر الأحمر':150,'مطروح':120},
    products:[
      {id:'honey-wild',name:'عسل البر البري',cat:'عسل طبيعي',desc:'عسل بطابع بري غني ونكهة دافئة.',emoji:'🍯',prices:{250:145,500:270,1000:500},stock:{250:20,500:15,1000:10}},
      {id:'honey-citrus',name:'عسل الحمضيات',cat:'عسل طبيعي',desc:'نكهة خفيفة ومنعشة لمحبي العسل الناعم.',emoji:'🌼',prices:{250:135,500:250,1000:460},stock:{250:18,500:14,1000:9}},
      {id:'honey-black-seed',name:'عسل حبة البركة',cat:'اختيارات مميزة',desc:'مزيج بطابع غني لمحبي النكهات القوية.',emoji:'🌿',prices:{250:160,500:300,1000:560},stock:{250:15,500:12,1000:8}},
      {id:'honey-mountain',name:'عسل جبلي فاخر',cat:'اختيارات مميزة',desc:'اختيار فاخر بنكهة عميقة ومميزة.',emoji:'🏔️',prices:{250:190,500:360,1000:680},stock:{250:12,500:9,1000:6}}
    ],
    reviews:[
      {name:'أحمد م.',text:'الطعم ممتاز والتغليف شيك جدًا، أكيد هطلب تاني.',stars:5},
      {name:'سارة ع.',text:'العسل وصلني بشكل ممتاز وطعمه طبيعي وواضح.',stars:5},
      {name:'محمد ر.',text:'تجربة جميلة جدًا وسرعة التواصل ممتازة.',stars:5}
    ],
    orders:[]
  };

  function load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(defaultData)}catch{return structuredClone(defaultData)}}
  function save(data){localStorage.setItem(KEY,JSON.stringify(data))}
  function money(n){return Number(n||0).toLocaleString('ar-EG')+' ج.م'}
  function getCart(){try{return JSON.parse(localStorage.getItem(CART))||[]}catch{return []}}
  function setCart(c){localStorage.setItem(CART,JSON.stringify(c))}
  function toast(msg){const t=document.getElementById('toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}}

  function initStore(){
    const data=load(), grid=document.getElementById('productGrid'); if(!grid)return;
    document.documentElement.style.setProperty('--primary',data.settings.primary);
    document.documentElement.style.setProperty('--secondary',data.settings.secondary);
    document.getElementById('year').textContent=new Date().getFullYear();
    renderProducts(data,'all'); renderReviews(data); renderCart(data); initFilters(data); initStoreEvents(data); initCheckout(data); initTheme();
  }

  function initFilters(data){
    const cats=['all',...new Set(data.products.map(p=>p.cat))], box=document.getElementById('filters');
    box.innerHTML=cats.map(c=>`<button class="${c==='all'?'active':''}" data-filter="${c}">${c==='all'?'الكل':c}</button>`).join('');
    box.onclick=e=>{const b=e.target.closest('button');if(!b)return;box.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProducts(data,b.dataset.filter)}
  }
  function renderProducts(data,filter='all'){
    const grid=document.getElementById('productGrid'); if(!grid)return;
    const arr=filter==='all'?data.products:data.products.filter(p=>p.cat===filter);
    grid.innerHTML=arr.map(p=>`<article class="product-card">
      <div class="product-img"><span>${p.emoji}</span><small>${p.cat}</small></div>
      <div class="product-info"><span class="product-cat">${p.cat}</span><h3>${p.name}</h3><p>${p.desc}</p>
      <div class="weight-row">${[250,500,1000].map(w=>`<button data-w="${w}" class="${w===500?'selected':''}" ${p.stock[w]<=0?'disabled':''}>${w===250?'ربع كيلو':w===500?'نصف كيلو':'كيلو'}</button>`).join('')}</div>
      <div class="product-bottom"><strong class="price" data-price>${money(p.prices[500])}</strong><button class="add-btn" data-id="${p.id}">أضف للسلة +</button></div></div>
    </article>`).join('');
    grid.querySelectorAll('.product-card').forEach(card=>{
      const p=data.products.find(x=>x.id===card.querySelector('.add-btn').dataset.id);
      card.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{card.querySelectorAll('[data-w]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');card.querySelector('[data-price]').textContent=money(p.prices[b.dataset.w])});
      card.querySelector('.add-btn').onclick=()=>{const w=Number(card.querySelector('.selected').dataset.w);addToCart(p,w);};
    });
  }
  function addToCart(p,w){const c=getCart(),i=c.findIndex(x=>x.id===p.id&&x.weight===w);if(i>-1)c[i].qty++;else c.push({id:p.id,weight:w,qty:1});setCart(c);renderCart(load());toast('تمت إضافة المنتج للسلة 🐝')}
  function renderCart(data){
    const c=getCart(), items=document.getElementById('cartItems'), count=document.getElementById('cartCount'), sub=document.getElementById('subtotal');
    if(!items)return; let total=0,qty=0;
    items.innerHTML=c.length?c.map((x,i)=>{const p=data.products.find(p=>p.id===x.id);if(!p)return '';total+=p.prices[x.weight]*x.qty;qty+=x.qty;return `<div class="cart-item"><div class="cart-icon">${p.emoji}</div><div><b>${p.name}</b><small>${x.weight} جم · ${money(p.prices[x.weight])}</small><div class="qty"><button data-cart="${i}" data-op="minus">−</button><span>${x.qty}</span><button data-cart="${i}" data-op="plus">+</button></div></div><strong>${money(p.prices[x.weight]*x.qty)}</strong></div>`}).join(''):'<div class="empty">السلة فاضية حاليًا 🍯<br><a href="#products">اختار منتجاتك</a></div>';
    count.textContent=qty;sub.textContent=money(total);
    items.querySelectorAll('[data-cart]').forEach(b=>b.onclick=()=>{const i=+b.dataset.cart;if(b.dataset.op==='plus')c[i].qty++;else c[i].qty--;if(c[i].qty<=0)c.splice(i,1);setCart(c);renderCart(data)});
  }
  function initStoreEvents(data){
    const drawer=document.getElementById('cartDrawer'),overlay=document.getElementById('overlay'),open=()=>{drawer.classList.add('open');overlay.classList.add('show')},close=()=>{drawer.classList.remove('open');overlay.classList.remove('show')};
    document.getElementById('cartBtn').onclick=open;document.getElementById('closeCart').onclick=close;overlay.onclick=close;
    document.getElementById('checkoutBtn').onclick=()=>{if(!getCart().length)return toast('أضف منتجًا للسلة أولًا');close();document.getElementById('checkoutModal').classList.add('show');updateCheckout(data)};
    document.getElementById('closeModal').onclick=()=>document.getElementById('checkoutModal').classList.remove('show');
  }
  function initCheckout(data){
    const g=document.getElementById('governorate');if(!g)return;
    g.innerHTML='<option value="">اختر المحافظة</option>'+Object.keys(data.shipping).map(x=>`<option>${x}</option>`).join('');
    g.onchange=()=>updateCheckout(data);
    document.getElementById('checkoutForm').onsubmit=e=>{e.preventDefault();placeOrder(data,new FormData(e.target))};
  }
  function updateCheckout(data){
    const c=getCart();let sub=0;c.forEach(x=>{const p=data.products.find(p=>p.id===x.id);if(p)sub+=p.prices[x.weight]*x.qty});
    const gov=document.getElementById('governorate')?.value, ship=sub>=data.settings.freeShipping?0:(data.shipping[gov]||0);
    ['checkoutSubtotal','shippingCost','checkoutTotal'].forEach((id,i)=>document.getElementById(id).textContent=money(i===0?sub:i===1?ship:sub+ship));
  }
  function placeOrder(data,fd){
    const c=getCart(),sub=c.reduce((s,x)=>{const p=data.products.find(p=>p.id===x.id);return s+(p?p.prices[x.weight]*x.qty:0)},0),gov=fd.get('governorate'),ship=sub>=data.settings.freeShipping?0:(data.shipping[gov]||0),total=sub+ship;
    const lines=c.map(x=>{const p=data.products.find(p=>p.id===x.id);return `- ${p.name} | ${x.weight} جم | ×${x.qty} | ${money(p.prices[x.weight]*x.qty)}`}).join('\n');
    const order={id:'QB-'+Date.now().toString().slice(-7),date:new Date().toISOString(),customer:Object.fromEntries(fd),items:c,subtotal:sub,shipping:ship,total,status:'جديد'};
    data.orders.push(order);save(data);setCart([]);renderCart(data);
    let msg=`طلب جديد من قطوف البر 🐝\n\nرقم الطلب: ${order.id}\nالاسم: ${fd.get('name')}\nالهاتف: ${fd.get('phone')}\nالمحافظة: ${gov}\nالعنوان: ${fd.get('address')}\n\nالمنتجات:\n${lines}\n\nقيمة المنتجات: ${money(sub)}\nالشحن: ${ship?money(ship):'مجاني'}\nالإجمالي: ${money(total)}\n${ship?`\nتنبيه: رسوم الشحن ${money(ship)} تُحوّل مقدمًا عبر فودافون كاش: ${data.settings.vodafone}`:''}\n${fd.get('notes')?`\nملاحظات: ${fd.get('notes')}`:''}`;
    const url='https://wa.me/'+String(data.settings.wa).replace(/\D/g,'')+'?text='+encodeURIComponent(msg);
    document.getElementById('checkoutModal').classList.remove('show');toast('تم تجهيز الطلب، سيتم فتح واتساب');setTimeout(()=>window.open(url,'_blank'),500);
  }
  function renderReviews(data){const box=document.getElementById('reviewGrid');if(!box)return;box.innerHTML=data.reviews.map(r=>`<article class="review-card"><div class="stars">${'★'.repeat(r.stars||5)}</div><p>“${r.text}”</p><b>${r.name}</b><small>عميل قطوف البر</small></article>`).join('')}
  function initTheme(){const saved=localStorage.getItem('qotof_theme');if(saved==='dark')document.body.classList.add('dark');document.getElementById('themeBtn').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('qotof_theme',document.body.classList.contains('dark')?'dark':'light')}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initStore);else initStore();

  /* Admin */
  window.QotofAdmin={init(){
    const login=document.getElementById('loginView'),app=document.getElementById('adminApp');
    if(!login)return;
    if(sessionStorage.getItem('qotof_admin')==='1')show();else login.classList.remove('hidden');
    document.getElementById('loginBtn').onclick=()=>{if(document.getElementById('adminPassword').value==='qotof2026'){sessionStorage.setItem('qotof_admin','1');show()}else alert('كلمة المرور غير صحيحة')};
    document.getElementById('logoutBtn').onclick=()=>{sessionStorage.removeItem('qotof_admin');location.reload()};
    function show(){login.classList.add('hidden');app.classList.remove('hidden');renderAdmin()}
  }};
  function renderAdmin(){
    const data=load();renderProductAdmin(data);renderOrders(data);renderSettings(data);renderReviewsAdmin(data);tabs();
    document.getElementById('addProduct').onclick=()=>{data.products.push({id:'p-'+Date.now(),name:'منتج جديد',cat:'عسل طبيعي',desc:'وصف المنتج',emoji:'🍯',prices:{250:100,500:190,1000:350},stock:{250:10,500:10,1000:10}});save(data);renderAdmin()};
    document.getElementById('addReview').onclick=()=>{data.reviews.push({name:'عميل جديد',text:'اكتب رأي العميل هنا',stars:5});save(data);renderAdmin()};
    document.getElementById('saveAll').onclick=()=>{save(data);alert('تم حفظ التعديلات')};
    document.getElementById('exportExcel').onclick=()=>exportCSV(data.orders);
  }
  function tabs(){document.querySelectorAll('.admin-tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.admin-tabs button,.tab-pane').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.tab).classList.add('active')})}
  function renderProductAdmin(data){
    document.getElementById('productAdminList').innerHTML=data.products.map((p,i)=>`<div class="admin-product"><div class="admin-product-main"><span class="admin-emoji">${p.emoji}</span><div><input data-p="${i}" data-k="name" value="${p.name}"><input data-p="${i}" data-k="desc" value="${p.desc}"></div></div><div class="weights">${[250,500,1000].map(w=>`<label>${w} جم <input type="number" data-p="${i}" data-price="${w}" value="${p.prices[w]}"><input type="number" data-p="${i}" data-stock="${w}" value="${p.stock[w]}" title="المخزون"></label>`).join('')}</div><button class="danger" data-delete="${i}">حذف</button></div>`).join('');
    document.querySelectorAll('[data-p]').forEach(el=>el.onchange=()=>{const i=+el.dataset.p;if(el.dataset.k)data.products[i][el.dataset.k]=el.value;if(el.dataset.price)data.products[i].prices[el.dataset.price]=+el.value;if(el.dataset.stock)data.products[i].stock[el.dataset.stock]=+el.value;save(data)});
    document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('حذف المنتج؟')){data.products.splice(+b.dataset.delete,1);save(data);renderAdmin()}});
  }
  function renderOrders(data){
    const box=document.getElementById('ordersList');if(!box)return;
    box.innerHTML=data.orders.length?data.orders.slice().reverse().map((o,i)=>`<div class="order-card"><div><b>${o.id}</b><small>${new Date(o.date).toLocaleString('ar-EG')}</small></div><div><b>${o.customer.name}</b><small>${o.customer.phone} · ${o.customer.governorate}</small></div><strong>${money(o.total)}</strong><select data-order="${data.orders.length-1-i}"><option ${o.status==='جديد'?'selected':''}>جديد</option><option ${o.status==='قيد التجهيز'?'selected':''}>قيد التجهيز</option><option ${o.status==='تم الشحن'?'selected':''}>تم الشحن</option><option ${o.status==='مكتمل'?'selected':''}>مكتمل</option><option ${o.status==='ملغي'?'selected':''}>ملغي</option></select></div>`).join(''):'<div class="empty">لا توجد طلبات حتى الآن.</div>';
    box.querySelectorAll('[data-order]').forEach(s=>s.onchange=()=>{data.orders[+s.dataset.order].status=s.value;save(data)})
  }
  function renderSettings(data){
    const ids=['waNumber','vodafone','freeShipping','primaryColor','secondaryColor'];ids.forEach(id=>{const el=document.getElementById(id);if(!el)return;el.value=id==='waNumber'?data.settings.wa:id==='vodafone'?data.settings.vodafone:id==='freeShipping'?data.settings.freeShipping:id==='primaryColor'?data.settings.primary:data.settings.secondary;el.onchange=()=>{if(id==='waNumber')data.settings.wa=el.value;if(id==='vodafone')data.settings.vodafone=el.value;if(id==='freeShipping')data.settings.freeShipping=+el.value;if(id==='primaryColor')data.settings.primary=el.value;if(id==='secondaryColor')data.settings.secondary=el.value;save(data)}});document.getElementById('shippingAdmin').innerHTML=Object.entries(data.shipping).map(([g,v])=>`<label>${g}<input type="number" data-ship="${g}" value="${v}"></label>`).join('');document.querySelectorAll('[data-ship]').forEach(x=>x.onchange=()=>{data.shipping[x.dataset.ship]=+x.value;save(data)})
  }
  function renderReviewsAdmin(data){
    document.getElementById('reviewsAdmin').innerHTML=data.reviews.map((r,i)=>`<div class="review-admin"><input data-r="${i}" data-rk="name" value="${r.name}"><textarea data-r="${i}" data-rk="text">${r.text}</textarea><input type="number" min="1" max="5" data-r="${i}" data-rk="stars" value="${r.stars}"><button class="danger" data-rdel="${i}">حذف</button></div>`).join('');
    document.querySelectorAll('[data-r]').forEach(el=>el.onchange=()=>{data.reviews[+el.dataset.r][el.dataset.rk]=el.dataset.rk==='stars'?+el.value:el.value;save(data)});
    document.querySelectorAll('[data-rdel]').forEach(b=>b.onclick=()=>{data.reviews.splice(+b.dataset.rdel,1);save(data);renderAdmin()})
  }
  function exportCSV(orders){
    const rows=[['رقم الطلب','التاريخ','الاسم','الهاتف','المحافظة','الإجمالي','الحالة'],...orders.map(o=>[o.id,new Date(o.date).toLocaleString('ar-EG'),o.customer.name,o.customer.phone,o.customer.governorate,o.total,o.status])];
    const csv='\uFEFF'+rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='qotof-elbr-orders.csv';a.click()
  }
})();
