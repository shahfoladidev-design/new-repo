/** Fixed full-viewport atmosphere for the public site — travel / landscape theme. */
export function SiteBackground() {
  return (
    <div className="site-atmosphere" aria-hidden>
      <div className="site-atmosphere__base" />
      <div className="site-atmosphere__sky" />
      <div className="site-atmosphere__horizon" />
      <div className="site-atmosphere__peaks" />
      <div className="site-atmosphere__contours" />
      <div className="site-atmosphere__grain" />
    </div>
  );
}
