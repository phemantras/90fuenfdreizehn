import React, { useEffect, useMemo, useRef, useState } from "react";
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

const SPIKE_START_SHAPES = [
  [
    [223.35, 433.3],
    [306, 254.7],
    [388.65, 433.3],
    [388.65, 433.3],
    [306, 433.3],
    [223.35, 433.3],
  ],
  [
    [397.35, 433.3],
    [480, 254.7],
    [562.65, 433.3],
    [562.65, 433.3],
    [480, 433.3],
    [397.35, 433.3],
  ],
  [
    [571.35, 433.3],
    [653.3, 254.7],
    [736.9, 433.3],
    [736.9, 433.3],
    [653.3, 433.3],
    [571.35, 433.3],
  ],
];

const SPIKE_REVEAL_SHAPES = [
  [
    [108, 432],
    [244, 190],
    [386, 432],
    [334, 432],
    [244, 284],
    [156, 432],
  ],
  [
    [338, 432],
    [474, 188],
    [614, 432],
    [562, 432],
    [474, 278],
    [386, 432],
  ],
  [
    [566, 432],
    [712, 194],
    [852, 432],
    [800, 432],
    [712, 286],
    [622, 432],
  ],
];

const SPIKE_START_COLOR = "#fff";
const SPIKE_END_COLORS = ["#f8f8f8", "#ff0000", "#009a00"];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function easeInOut(progress) {
  return 0.5 - 0.5 * Math.cos(Math.PI * progress);
}

function interpolateShape(start, end, progress) {
  return start
    .map(([startX, startY], index) => {
      const [endX, endY] = end[index];
      return `${lerp(startX, endX, progress)},${lerp(startY, endY, progress)}`;
    })
    .join(" ");
}

function mixColor(startHex, endHex, progress) {
  const normalizeHex = (hex) => {
    const value = hex.replace("#", "");
    return value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  };

  const start = normalizeHex(startHex);
  const end = normalizeHex(endHex);
  const channels = [0, 2, 4].map((offset) => {
    const startValue = Number.parseInt(start.slice(offset, offset + 2), 16);
    const endValue = Number.parseInt(end.slice(offset, offset + 2), 16);
    return Math.round(lerp(startValue, endValue, progress));
  });

  return `rgb(${channels.join(" ")})`;
}

function FrankenrechenMorph() {
  const rootRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const finalProgress = 0.78;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setHasEnteredViewport(true);
      return undefined;
    }

    if (hasEnteredViewport || !rootRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.98) {
          setHasEnteredViewport(true);
          observer.disconnect();
        }
      },
      {
        threshold: [0.98, 1],
      }
    );

    observer.observe(rootRef.current);

    return () => observer.disconnect();
  }, [hasEnteredViewport, prefersReducedMotion]);

  useEffect(() => {
    if (!hasEnteredViewport) {
      return undefined;
    }

    if (prefersReducedMotion) {
      setProgress(finalProgress);
      return undefined;
    }

    const morphDuration = 6200;
    let frameId;
    let startTime = null;

    const tick = (now) => {
      if (startTime === null) {
        startTime = now;
      }

      const elapsed = now - startTime;
      const rawProgress = elapsed >= morphDuration ? 1 : elapsed / morphDuration;
      const nextProgress = Math.min(rawProgress, finalProgress);
      setProgress(nextProgress);

      if (nextProgress < finalProgress) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [finalProgress, hasEnteredViewport, prefersReducedMotion]);

  const dissolveProgress = easeInOut(clamp(progress / 0.5, 0, 1));
  const spikeProgress = easeInOut(clamp((progress - 0.08) / 0.62, 0, 1));
  const shieldOpacity = lerp(1, 0, easeInOut(clamp((progress - 0.1) / 0.56, 0, 1)));
  const imageScale = lerp(1, 0.985, dissolveProgress);
  const imageShiftY = lerp(0, 8, dissolveProgress);
  const spikeOpacity = lerp(1, 1, progress);

  return (
    <div ref={rootRef} className="morph-showcase" aria-hidden="true">
      <svg className="morph-showcase__svg" viewBox="0 0 960 760" role="presentation">
        <g
          opacity={shieldOpacity}
          transform={`translate(0 ${imageShiftY}) scale(${imageScale})`}
          transformOrigin="480 352"
        >
          <image href="/Frankenrechen.svg" x="210" y="42" width="540" height="623.25" preserveAspectRatio="xMidYMid meet" />
        </g>

        <g opacity={spikeOpacity}>
          {SPIKE_START_SHAPES.map((shape, index) => (
            <polygon
              key={`overlay-${SPIKE_END_COLORS[index]}`}
              points={interpolateShape(shape, SPIKE_REVEAL_SHAPES[index], spikeProgress)}
              fill={mixColor(SPIKE_START_COLOR, SPIKE_END_COLORS[index], spikeProgress)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

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

  useEffect(() => {
    if (isShopPage) {
      return undefined;
    }

    const scrollToCurrentHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) {
        return;
      }

      const target = document.getElementById(hash);
      if (!target) {
        return;
      }

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const behavior = prefersReducedMotion ? "auto" : "smooth";

      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior, block: "start" });
      });
    };

    scrollToCurrentHash();
    window.addEventListener("hashchange", scrollToCurrentHash);

    return () => {
      window.removeEventListener("hashchange", scrollToCurrentHash);
    };
  }, [isShopPage]);

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
              <div className="hero-banner">
                <img
                  src="/skyline_zirndorf.jpg"
                  alt="90FuenfDreizehn Hero Motiv"
                  className="hero-banner__image"
                  width="2750"
                  height="1200"
                />
                <div className="hero-banner__veil" aria-hidden="true" />
                <h1 id="hero-title" className="hero-banner__title">
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

            <section className="section section--morph" aria-labelledby="brand-morph-title">
              <div className="container">
                <header className="section-header">
                  <h2 id="brand-morph-title">Fraenkische Identitaet</h2>
                  <p>Der Frankenrechen in unserem Logo ist mehr als ein Symbol – er ist das verbindende Element zwischen regionaler Identität und urbanem Lifestyle.<br />
                  Ein Design, das unsere Stadt repräsentiert: modern, selbstbewusst und tief verwurzelt. So verschmilzt Tradition mit Gegenwart – sichtbar auf jedem Piece, tragbar im Alltag.</p>
                </header>
                <FrankenrechenMorph />
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
