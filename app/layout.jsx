import './globals.css';
export const metadata={title:'WattBudget: manage your electrical usage',description:'Add your appliances, simulate your battery hour by hour, and get a solar setup that fits.',openGraph:{title:'WattBudget: manage your electrical usage',description:'Add your appliances, simulate your battery hour by hour, and get a solar setup that fits.',type:'website'}};
export const viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#000000'};
export default function RootLayout({children}){
  return <html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  </head><body>{children}</body></html>}
