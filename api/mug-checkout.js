const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCT_PRICE_CENTS = 1975;
const SHIPPING = {
  IT:{name:"Italy",base:495,extra:195},DE:{name:"Germany",base:749,extra:150},GB:{name:"United Kingdom",base:890,extra:300},AT:{name:"Austria",base:790,extra:150},BE:{name:"Belgium",base:790,extra:150},BG:{name:"Bulgaria",base:1290,extra:150},HR:{name:"Croatia",base:800,extra:300},CY:{name:"Cyprus",base:2690,extra:150},CZ:{name:"Czech Republic",base:650,extra:150},DK:{name:"Denmark",base:1490,extra:150},EE:{name:"Estonia",base:1290,extra:150},FI:{name:"Finland",base:1890,extra:150},FR:{name:"France",base:990,extra:190},GR:{name:"Greece",base:2690,extra:150},HU:{name:"Hungary",base:650,extra:150},IE:{name:"Ireland",base:1690,extra:150},LV:{name:"Latvia",base:650,extra:150},LI:{name:"Liechtenstein",base:800,extra:300},LT:{name:"Lithuania",base:790,extra:150},LU:{name:"Luxembourg",base:890,extra:150},MT:{name:"Malta",base:2690,extra:150},NL:{name:"Netherlands",base:729,extra:150},PL:{name:"Poland",base:650,extra:150},PT:{name:"Portugal",base:650,extra:150},RO:{name:"Romania",base:650,extra:150},SK:{name:"Slovakia",base:650,extra:150},SI:{name:"Slovenia",base:650,extra:150},ES:{name:"Spain",base:990,extra:190},SE:{name:"Sweden",base:2260,extra:190},CH:{name:"Switzerland",base:1540,extra:300},NO:{name:"Norway",base:1640,extra:300},BR:{name:"Brazil",base:979,extra:360},CA:{name:"Canada",base:1029,extra:360},AU:{name:"Australia",base:1670,extra:360}
};

module.exports = async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  try{
    const country=String(req.body?.country||"").toUpperCase();
    const quantity=Math.max(1,Math.min(5,Number(req.body?.quantity)||1));
    const rate=SHIPPING[country];
    if(!rate) return res.status(400).json({error:"Shipping is not configured for that destination yet."});
    const shippingCents=rate.base+Math.max(0,quantity-1)*rate.extra;
    const site=(process.env.SITE_URL||"https://onedreameach.com").replace(/\/$/,"");
    const session=await stripe.checkout.sessions.create({
      mode:"payment",
      line_items:[
        {price_data:{currency:"eur",product_data:{name:"One Dream Each — Dream Mug",description:"330 ml / 11 oz heat-changing ceramic mug · one-side print"},unit_amount:PRODUCT_PRICE_CENTS},quantity},
        {price_data:{currency:"eur",product_data:{name:`Economy shipping — ${rate.name}`},unit_amount:shippingCents},quantity:1}
      ],
      shipping_address_collection:{allowed_countries:[country]},
      phone_number_collection:{enabled:true},
      customer_creation:"always",
      success_url:`${site}/mug-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${site}/dream-mug#buy`,
      metadata:{order_type:"dream_mug",product:"dream_mug_first_edition",country,quantity:String(quantity),shipping_cents:String(shippingCents)}
    });
    return res.status(200).json({url:session.url});
  }catch(error){
    console.error("MUG CHECKOUT ERROR:",error);
    return res.status(500).json({error:"Unable to create Dream Mug checkout",details:error.message});
  }
};
