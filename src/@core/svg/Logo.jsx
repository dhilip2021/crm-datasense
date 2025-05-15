import Image from "next/image"

import LogoImg from "@assets/images/logo.png"

const Logo = props => {
  return (
    <Image src={LogoImg} width={30} height={30} alt="logo" />
  )
}

export default Logo
