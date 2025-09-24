import Image from "next/image"

import LogoImg from "@assets/images/logo.png"

const Logo = props => {
  return (
    <Image src={LogoImg} width={180} height={50} alt="logo" />
  )
}

export default Logo
