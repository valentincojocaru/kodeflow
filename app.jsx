const { useState } = React;

function App() {
  const [hire, setHire] = useState(false);
  const openHire = () => setHire(true);

  // scroll reveal
  React.useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });

  return (
    <React.Fragment>
      <Navbar onHire={openHire} />
      <Hero onHire={openHire} />
      <Sections onHire={openHire} />
      <HireModal open={hire} onClose={() => setHire(false)} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
