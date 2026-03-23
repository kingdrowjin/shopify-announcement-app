import React, { useState, useEffect, useCallback } from "react";
import {
  AppProvider,
  Page,
  Layout,
  Card,
  TextField,
  Button,
  Banner,
  DataTable,
  Text,
  BlockStack,
  InlineStack,
  Badge,
} from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

const API_URL = import.meta.env.VITE_API_URL || "";

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/announcements`);
      const data = await res.json();
      setHistory(data);
    } catch {
      // ignore
    }
  }, []);

  const fetchCurrent = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/current-announcement`);
      const data = await res.json();
      setCurrentAnnouncement(data.text || "");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchCurrent();
  }, [fetchHistory, fetchCurrent]);

  const handleSave = async () => {
    if (!text.trim()) {
      setStatus({ type: "warning", message: "Please enter announcement text" });
      return;
    }
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${API_URL}/api/announcement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: data.message });
        setText("");
        fetchHistory();
        fetchCurrent();
      } else {
        setStatus({ type: "critical", message: data.error });
      }
    } catch {
      setStatus({ type: "critical", message: "Failed to connect to server" });
    } finally {
      setLoading(false);
    }
  };

  const rows = history.map((item) => [
    item.text,
    item.syncedToShopify ? "Yes" : "No",
    new Date(item.createdAt).toLocaleString(),
  ]);

  return (
    <AppProvider i18n={{}}>
      <Page title="Announcement Manager">
        <Layout>
          {status && (
            <Layout.Section>
              <Banner
                title={status.message}
                tone={status.type}
                onDismiss={() => setStatus(null)}
              />
            </Layout.Section>
          )}

          {currentAnnouncement && (
            <Layout.Section>
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="start" gap="200">
                    <Text variant="headingMd" as="h2">Current Live Announcement</Text>
                    <Badge tone="success">Live</Badge>
                  </InlineStack>
                  <Text variant="bodyLg" as="p">{currentAnnouncement}</Text>
                </BlockStack>
              </Card>
            </Layout.Section>
          )}

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Set Announcement</Text>
                <TextField
                  label="Announcement Text"
                  value={text}
                  onChange={setText}
                  placeholder='e.g., "Sale 50% Off - This Weekend Only!"'
                  autoComplete="off"
                  multiline={2}
                />
                <InlineStack align="end">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    loading={loading}
                  >
                    Save
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Announcement History</Text>
                {rows.length > 0 ? (
                  <DataTable
                    columnContentTypes={["text", "text", "text"]}
                    headings={["Text", "Synced to Shopify", "Created At"]}
                    rows={rows}
                  />
                ) : (
                  <Text as="p" tone="subdued">No announcements yet.</Text>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}

export default App;
