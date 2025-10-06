import Link from "next/link";
import Image from "next/image";

function NotFound() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden">
      <section
        id="notfound"
        className="flex max-w-[35rem] flex-col items-center gap-[2rem] px-[2rem]"
      >
        <Image
          src="/img/logo.svg"
          alt=""
          width={75}
          height={90}
          className="h-[9rem] w-auto"
        />
        <div id="notfound-title" className="flex flex-col text-center">
          {/* <Title className="text-center">Sayfa Bulunamadı</Title>
          <Text>
            Üzgünüz, aradığınız sayfa kaldırılmış veya taşınmış olabilir.
          </Text> */}
        </div>
        <Link href="/">{/* <Button>Panele Dön</Button> */}</Link>
      </section>
    </main>
  );
}

export default NotFound;
