import Image from "next/image"

import LogoImg from "@assets/images/logo.png"
import Cookies from "js-cookie"

const Logo = props => {

  const orgLogo = Cookies.get('organization_logo') 


  return (
    // <>
    //   {
    //    orgLogo  ? (
    //        <Image src={orgLogo} width={180} height={50} alt="logo" />
    //   ):(
    //     <Image src={LogoImg} width={180} height={50} alt="logo" />
    //   )
    // }
    // </>

    <Image src={LogoImg} width={180} height={50} alt="logo" />
    
     
    
    
  )
}

export default Logo
