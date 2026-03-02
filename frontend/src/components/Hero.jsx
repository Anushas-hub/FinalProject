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
    height: "80vh",
    background: "linear-gradient(120deg, #e8f5e9, #e0f2f1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    textAlign: "center",
  },
  title: {
    fontSize: "64px",
    color: "#1b5e20",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "22px",
    color: "#555",
  },
};