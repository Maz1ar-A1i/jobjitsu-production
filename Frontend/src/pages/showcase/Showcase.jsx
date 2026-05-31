const Showcase = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        backgroundColor: "#0b1326",
      }}
    >
      <iframe
        src="/showcase/index.html"
        title="JobJitsu Showcase"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </div>
  );
};

export default Showcase;
