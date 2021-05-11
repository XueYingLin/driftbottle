import React, { useEffect } from "react";
import "./TwitterShare.css"

export function TwitterShare({ text }) {

  let safeText = encodeURIComponent(text)

  return <section className="twitterContainer">
    <a className="TwitterButton" href={"https://twitter.com/share?ref_src=twsrc%5Etfw&text=" + safeText}
      data-show-count="false"><i className="fab fa-twitter"></i>

      <span className="TwitterLabel">Tweet</span></a>

  </section >;
}