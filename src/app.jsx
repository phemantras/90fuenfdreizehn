import React, { useEffect, useMemo, useState } from "react";
import "./app.css";

const SPREADSHOP = {
  shopName: "90fuenfdreizehn",
  locale: "de_DE",
  prefix: "https://90fuenfdreizehn.myspreadshop.de",
  baseId: "myShop",
  scriptSrc:
    "https://90fuenfdreizehn.myspreadshop.de/shopfiles/shopclient/shopclient.nocache.js",
};

const aboutUsCards = [
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
    title: "> Die Verbindung",
    text: "Egal, ob Buerger oder Gast - du bleibst mit Zirndorf verbunden.",
    placeholder: "BILD PLATZHALTER (Souvenir vibe: Cap/Bag/Sticker)",
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

function SpreadshopSection({ showHeader = true, isShopPage = false }) {
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
    <section
      id="shop"
      className={`section ${isShopPage ? "section--shop-page" : ""}`}
      aria-labelledby="shop-title"
    >
      <div className="container">
        {showHeader ? (
          <header className="section-header">
            <h2 id="shop-title">Shop</h2>
            <p>Get your gear now!</p>
          </header>
        ) : null}

        {isShopPage ? (
          <div id="myShop" className="spreadshop-mount" role="region" aria-label="Spreadshop">
            <a href={SPREADSHOP.prefix}>{SPREADSHOP.shopName}</a>
            <p className="spreadshop-hint">
              Falls der Shop beim lokalen Dev-Start kurz laedt: normal - Script wird nachgeladen.
            </p>
          </div>
        ) : (
          <div className="card card--flush">
            <div id="myShop" className="spreadshop-mount" role="region" aria-label="Spreadshop">
              <a href={SPREADSHOP.prefix}>{SPREADSHOP.shopName}</a>
              <p className="spreadshop-hint">
                Falls der Shop beim lokalen Dev-Start kurz laedt: normal - Script wird nachgeladen.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const currentYear = new Date().getFullYear();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isImpressumOpen, setIsImpressumOpen] = useState(false);
  const pathname = window.location.pathname;
  const normalizedPath = pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const isShopPage = normalizedPath === "/shop";

  const closeMenu = () => setIsMenuOpen(false);
  const closeImpressum = () => setIsImpressumOpen(false);

  useEffect(() => {
    if (!isImpressumOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsImpressumOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isImpressumOpen]);

  const handleNavClick = (event, targetId) => {
    event.preventDefault();
    closeMenu();

    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = prefersReducedMotion ? "auto" : "smooth";

    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior, block: "start" });
      window.history.replaceState(null, "", `#${targetId}`);
    });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar__inner">
          {isShopPage ? (
            <div className="topbar__shop-title">Shop - Get your gear now!</div>
          ) : (
            <a className="brand" href="#top" aria-label="Startseite 90FuenfDreizehn" onClick={closeMenu}>
              <img src="/logo_light.png" alt="90FuenfDreizehn" className="brand__logo brand__logo--nav" />
            </a>
          )}

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
            {isShopPage ? (
              <>
                <a href="/#aboutus" onClick={closeMenu}>
                  About us
                </a>
                <a href="/#community" onClick={closeMenu}>
                  Community
                </a>
                <a href="/shop" onClick={closeMenu}>
                  Shop
                </a>
              </>
            ) : (
              <>
                <a href="#aboutus" onClick={(event) => handleNavClick(event, "aboutus")}>
                  About us
                </a>
                <a href="#community" onClick={(event) => handleNavClick(event, "community")}>
                  Community
                </a>
                <a href="/shop" onClick={closeMenu}>
                  Shop
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      <main id="top" className={isShopPage ? "main--subpage" : ""}>
        {isShopPage ? (
          <SpreadshopSection showHeader={false} isShopPage />
        ) : (
          <>
            <section className="section section--hero" aria-labelledby="hero-title">
              <div className="hero-placeholder">
                <img
                  src="/zirndorf_view.jpeg"
                  alt="90FuenfDreizehn Hero Motiv"
                  className="hero-placeholder__image"
                />
                <div className="hero-placeholder__veil" aria-hidden="true" />
                <h1 id="hero-title" className="hero-placeholder__title">
                  <span>Deine Stadt.</span>
                  <span>Deine Brand.</span>
                </h1>
              </div>
            </section>

            <section id="aboutus" className="section" aria-labelledby="aboutus-title">
              <div className="container">
                <header className="section-header">
                  <h2 id="aboutus-title">About us</h2>
                  <p>
                    Aus 90513. Fuer 90513. Drei Farben. Drei Spitzen. Eine Haltung. Wir tragen, wo wir herkommen.
                    <br />
                    - Repraesentiere deine Stadt -
                  </p>
                </header>

                <div className="grid grid--3">
                  {aboutUsCards.map((card) => (
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
                    <a className="button button--secondary" href="/shop">
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
          </>
        )}

      </main>

      {!isShopPage ? (
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
                <a href="/shop">Shop</a>
                <a href="/#aboutus">About us</a>
                <a href="/#community">Community</a>
              </div>

              <div>
                <h3 className="footer-title">Rechtliches</h3>
                <button type="button" className="footer-link-button" onClick={() => setIsImpressumOpen(true)}>
                  Impressum
                </button>
                <a href="/datenschutz">Datenschutz (Platzhalter)</a>
              </div>
            </div>

            <div className="footer-bottom">
              <span>(c) {currentYear} 90FuenfDreizehn</span>
              <span>Made for 90513</span>
            </div>
          </div>
        </footer>
      ) : null}

      {isImpressumOpen ? (
        <div className="modal-backdrop" onClick={closeImpressum}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="impressum-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="modal-close" aria-label="Impressum schliessen" onClick={closeImpressum}>
              x
            </button>
            <img src="/logo_light.png" alt="90FuenfDreizehn" className="modal-logo" />
            <h2 id="impressum-title">Impressum</h2>
            <p>Fuer die Inhalte verantwortlich:</p>
            <p>
              Andreas Bechtloff
              <br />
              Vogelherdstr. 16
              <br />
              90513 Zirndorf
              <br />
              Deutschland
            </p>
            <p>
              E-Mail: Andreas_Bechtloff@hotmail.de
              <br />
              Telefon: 0491722080484
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
