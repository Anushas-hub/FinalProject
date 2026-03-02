export default function Hero() {
  return (
    <section style={styles.hero}>
      <div style={styles.content}>
        <h1 style={styles.title}>SmartStudy</h1>
        <p style={styles.subtitle}>Let’s Learn and Collaborate</p>
      </div>
    </section>
  );
}

const styles = {
  hero: {
    height: "60vh",
    margin: 0,                 // FIX 1
    padding: 0,                // FIX 2
    background: "linear-gradient(120deg, #e8f5e9, #e0f2f1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  content: {
    textAlign: "center"
  },

  title: {
    fontSize: "60px",
    color: "#264ed2",
    margin: 0                  // FIX 3 (IMPORTANT)
  },

  subtitle: {
    fontSize: "22px",
    color: "#121825",
    marginTop: "10px",         // controlled spacing
    marginBottom: 0
  }
};