import React, { useEffect } from "react";
import "./TwitterShare.css"

export function TwitterShare({ text }) {

  let safeText = encodeURIComponent(text)

  return <section className="twitterContainer">
    <a class="TwitterButton" href={"https://twitter.com/share?ref_src=twsrc%5Etfw&text=" + safeText}
      data-show-count="false"><i class="fab fa-twitter"></i>

      <span class="TwitterLabel">Tweet</span></a>

  </section >;
}