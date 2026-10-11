import Intro from "@/components/Intro";
import Nav from "@/components/Nav";
import Scene from "@/components/Scene";
import Flavours from "@/components/Flavours";
import Label from "@/components/Label";
import Signup from "@/components/Signup";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Intro />
      <Nav />
      <main id="top">
        <Scene />
        <Flavours />
        <Label />
        <Signup />
      </main>
      <Footer />
    </>
  );
}
