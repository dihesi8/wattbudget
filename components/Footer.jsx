import Logo from './Logo';
export default function Footer({go}){
  return <footer><div className="w"><Logo c="lg"/><p style={{margin:'8px 0 0',color:'#fff',letterSpacing:'.3em',fontSize:12}}>W A T T B U D G E T</p>
    <nav><button className="lkb" onClick={()=>go('home')}>Home</button><button className="lkb" onClick={()=>go('planner')}>Planner</button><button className="lkb" onClick={()=>go('student')}>Students</button><button className="lkb" onClick={()=>go('own')}>My setup</button><a href="#faq">FAQ</a></nav>
    <p>Estimates assume 90% inverter efficiency and 70–75% solar yield. Real results vary. Built for LaunchPad Hacks. Weather data by <a href="https://open-meteo.com/">Open-Meteo.com</a>; place names by <a href="https://www.bigdatacloud.com/">BigDataCloud</a>.</p></div></footer>;
}
