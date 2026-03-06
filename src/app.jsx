import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./app.css";

const SPREADSHOP = {
  shopName: "90fuenfdreizehn",
  locale: "de_DE",
  prefix: "https://90fuenfdreizehn.myspreadshop.de",
  baseId: "myShop",
  scriptSrc:
    "https://90fuenfdreizehn.myspreadshop.de/shopfiles/shopclient/shopclient.nocache.js",
};

const storyCards = [
  {
    title: "> Der Code",
    text: "90513 ist mehr als eine PLZ. Es ist ein Zeichen: \"Ich bin von hier.\" Ohne grosse Worte.",
    placeholder: "BILD PLATZHALTER (PLZ/Sign/Sticker in der Stadt)",
  },
  {
    title: "> Die Haltung",
    text: "Stolz, aber nicht laut. Lokal, aber offen. Fuer alle, die Zirndorf im Herzen haben.",
    placeholder: "BILD PLATZHALTER (Menschen in Alltagsszenen)",
  },
  {
    title: "> Das Mitnehmen",
    text: "Gaeste nehmen ein Stueck Zirndorf mit - Buerger tragen es jeden Tag.",
    placeholder: "BILD PLATZHALTER (Souvenir vibe: Cap/Bag/Sticker)",
  },
];

const faqItems = [
  {
    title: "Ist das fuer alle Zirndorfer?",
    text: "Ja. Genau das ist die Idee: eine Marke, die jede:r tragen kann - und sich trotzdem besonders anfuehlt.",
  },
  {
    title: "Versand & Rueckgabe?",
    text: "Produktion und Versand laufen ueber Spreadshirt. Rueckgabe in der Regel 30 Tage (Details im Shop).",
  },
  {
    title: "Warum \"90513\"?",
    text: "Weil es ein Code ist. Ein stilles Zeichen fuer Zugehoerigkeit - fuer Buerger und Fans der Stadt.",
  },
  {
    title: "Kann ich mitmachen / collab?",
    text: "Ja: lokale Vereine, Bars, Crews, Fotografen. (Platzhalter: Kontaktformular/DM.)",
  },
];

function Placeholder({ label, height = 280 }) {
  return (
    <div className="placeholder" style={{ "--placeholder-height": `${height}px` }}>
      <div className="placeholder__label">{label}</div>
      <div className="placeholder__hint">
        (Hier spaeter Foto/Video aus Zirndorf: Marktplatz, Bibert, Altstadt, Leute, Events)
      </div>
    </div>
  );
}

function InstagramPost({ permalink }) {
  useEffect(() => {
    const scriptId = "instagram-embed-script";

    const processEmbeds = () => {
      if (window.instgrm?.Embeds) {
        window.instgrm.Embeds.process();
      }
    };

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      processEmbeds();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = "https://www.instagram.com/embed.js";
    script.onload = processEmbeds;
    document.body.appendChild(script);
  }, [permalink]);

  return (
    <blockquote
      className="instagram-media app-instagram-embed"
      data-instgrm-captioned
      data-instgrm-permalink={permalink}
      data-instgrm-version="14"
      data-instgrm-theme="dark"
    >
      <a href={permalink} target="_blank" rel="noreferrer">
        Beitrag auf Instagram ansehen
      </a>
    </blockquote>
  );
}

function SpreadshopSection() {
  const config = useMemo(
    () => ({
      shopName: SPREADSHOP.shopName,
      locale: SPREADSHOP.locale,
      prefix: SPREADSHOP.prefix,
      baseId: SPREADSHOP.baseId,
    }),
    []
  );

  useEffect(() => {
    const configScriptId = "spreadshop-config";
    const clientScriptId = "spreadshop-client";

    window.spread_shop_config = config;

    if (!document.getElementById(configScriptId)) {
      const configScript = document.createElement("script");
      configScript.id = configScriptId;
      configScript.type = "text/javascript";
      configScript.text = `var spread_shop_config = ${JSON.stringify(config)};`;
      document.body.appendChild(configScript);
    }

    if (!document.getElementById(clientScriptId)) {
      const clientScript = document.createElement("script");
      clientScript.id = clientScriptId;
      clientScript.type = "text/javascript";
      clientScript.async = true;
      clientScript.src = SPREADSHOP.scriptSrc;
      document.body.appendChild(clientScript);
    }
  }, [config]);

  return (
    <section id="shop" className="section" aria-labelledby="shop-title">
      <div className="container">
        <header className="section-header">
          <h2 id="shop-title">Shop</h2>
          <p>Offizieller Spreadshop - eingebettet in unsere Brand-Seite.</p>
        </header>

        <div className="card card--flush">
          <div id="myShop" className="spreadshop-mount" role="region" aria-label="Spreadshop">
            <a href={SPREADSHOP.prefix}>{SPREADSHOP.shopName}</a>
            <p className="spreadshop-hint">
              Falls der Shop beim lokalen Dev-Start kurz laedt: normal - Script wird nachgeladen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const currentYear = new Date().getFullYear();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroPlaceholderRef = useRef(null);
  const heroTitleRef = useRef(null);

  const closeMenu = () => setIsMenuOpen(false);

  useLayoutEffect(() => {
    const container = heroPlaceholderRef.current;
    const title = heroTitleRef.current;

    if (!container || !title) {
      return;
    }

    const fitTitleToContainer = () => {
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const styles = window.getComputedStyle(container);
      const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const containerWidth = Math.max(0, container.clientWidth - paddingX);
      const maxWidth = Math.min(containerWidth, Math.floor(viewportWidth * 0.98));
      const minFontSize = 16;
      const maxFontSize = 220;

      let low = minFontSize;
      let high = maxFontSize;
      let best = minFontSize;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        title.style.fontSize = `${mid}px`;

        if (title.scrollWidth <= maxWidth) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      title.style.fontSize = `${best}px`;
    };

    fitTitleToContainer();
    document.fonts?.ready.then(fitTitleToContainer).catch(() => {});

    const observer = new ResizeObserver(fitTitleToContainer);
    observer.observe(container);
    window.addEventListener("resize", fitTitleToContainer);
    window.visualViewport?.addEventListener("resize", fitTitleToContainer);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fitTitleToContainer);
      window.visualViewport?.removeEventListener("resize", fitTitleToContainer);
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar__inner">
          <a className="brand" href="#top" aria-label="Startseite 90FuenfDreizehn">
            <img src="/logo_light.png" alt="90FuenfDreizehn" className="brand__logo brand__logo--nav" />
          </a>

          <button
            type="button"
            className="burger-toggle"
            aria-label="Menue oeffnen"
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            id="main-navigation"
            className={`topnav ${isMenuOpen ? "topnav--open" : ""}`}
            aria-label="Hauptnavigation"
          >
            <a href="#story" onClick={closeMenu}>
              Story
            </a>
            <a href="#community" onClick={closeMenu}>
              Community
            </a>
            <a href="#shop" onClick={closeMenu}>
              Shop
            </a>
            <a href="#faq" onClick={closeMenu}>
              FAQ
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="section section--hero" aria-labelledby="hero-title">
          <div className="hero-placeholder" role="img" aria-label="Hero Platzhalter" ref={heroPlaceholderRef}>
            <h1 id="hero-title" className="hero-placeholder__title" ref={heroTitleRef}>
              <span className="hero-placeholder__base">90</span>
              <span className="hero-placeholder__strong">FUENF</span>
              <span className="hero-placeholder__base">DREIZEHN</span>
            </h1>
          </div>
        </section>

        <section id="story" className="section" aria-labelledby="story-title">
          <div className="container">
            <header className="section-header">
              <h2 id="story-title">Warum 90FuenfDreizehn?</h2>
              <p>Eine Identitaetsmarke: Zuhause tragen. Zirndorf zeigen. Zusammen gehoeren.</p>
            </header>

            <div className="grid grid--3">
              {storyCards.map((card) => (
                <article className="card" key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <Placeholder label={card.placeholder} height={220} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="community" className="section" aria-labelledby="community-title">
          <div className="container">
            <header className="section-header">
              <h2 id="community-title">Zirndorfer tragen 90FuenfDreizehn</h2>
            </header>

            <article className="card">
              <div className="community-head">
                <div>
                  <h3>#90FuenfDreizehn</h3>
                  <p>Poste dein Outfit in Zirndorf und tagge uns! Werde Teil der Community!</p>
                </div>
                <a className="button button--secondary" href="#shop">
                  Jetzt mitmachen
                </a>
              </div>

              <div className="grid grid--community">
                <InstagramPost permalink="https://www.instagram.com/p/DVWrnTcjjFa/?utm_source=ig_embed&utm_campaign=loading?theme=dark" />
                <InstagramPost permalink="https://www.instagram.com/p/DVWsWWHjnOE/?utm_source=ig_embed&utm_campaign=loading" />
                <Placeholder label="INSTAGRAM POST PLATZHALTER 3" height={220} />
                <Placeholder label="INSTAGRAM POST PLATZHALTER 4" height={220} />
              </div>

              <div className="spacer" />
              <Placeholder label="VIDEO PLATZHALTER (Reel: 90513 Montage / Event)" height={320} />
            </article>
          </div>
        </section>

        <SpreadshopSection />

        <section id="faq" className="section" aria-labelledby="faq-title">
          <div className="container">
            <header className="section-header">
              <h2 id="faq-title">FAQ</h2>
              <p>Kurz & klar - reduziert Kauf-Friktion.</p>
            </header>

            <div className="grid grid--2">
              {faqItems.map((item) => (
                <article className="card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="brand footer-brand">
                <img src="/logo_light.png" alt="90FuenfDreizehn" className="brand__logo brand__logo--footer" />
              </div>
              <p className="footer-copy">Aus Zirndorf. Fuer Zirndorf. Eine Marke fuer Buerger & Gaeste.</p>
            </div>

            <div>
              <h3 className="footer-title">Links</h3>
              <a href="#shop">Shop</a>
              <a href="#story">Story</a>
              <a href="#community">Community</a>
              <a href="#faq">FAQ</a>
            </div>

            <div>
              <h3 className="footer-title">Rechtliches</h3>
              <a href="/impressum">Impressum (Platzhalter)</a>
              <a href="/datenschutz">Datenschutz (Platzhalter)</a>
            </div>
          </div>

          <div className="footer-bottom">
            <span>(c) {currentYear} 90FuenfDreizehn</span>
            <span>Made for 90513</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
