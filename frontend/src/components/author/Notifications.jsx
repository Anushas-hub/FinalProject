export default function Notifications() {
  const notifications = [];

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Notifications</h2>

      {notifications.length === 0 ? (
        <div style={styles.emptyCard}>
          No notifications yet.
        </div>
      ) : (
        notifications.map((note, index) => (
          <div key={index} style={styles.card}>
            {note.message}
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "900px", margin: "0 auto" },
  heading: { marginBottom: "25px", color: "#1e293b" },

  emptyCard: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    textAlign: "center",
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    marginBottom: "15px",
  },
};