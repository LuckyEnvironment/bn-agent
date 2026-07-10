import Link from "next/link";

export function Nav() {
  return (
    <nav className="nav">
      <div className="wrap">
        <Link className="logo" href="/">
          <span className="mark" /> BN AGENT
        </Link>
        <div className="navlinks">
          <Link href="/registry">Registry</Link>
          <Link href="/handboek">Handboek</Link>
          <Link href="/#werkt">Hoe het werkt</Link>
          <Link href="/#vertrouwen">Certificering</Link>
          <Link href="/#prijzen">Prijzen</Link>
          <Link href="/developers">Developers</Link>
        </div>
        <Link className="navcta" href="/#toegang">
          Vraag toegang aan
        </Link>
      </div>
    </nav>
  );
}
