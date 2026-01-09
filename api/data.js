let latestData = {
  temperature: null,
  humidity: null,
};

export default function handler(req, res) {
  // ESP32 kirim data
  if (req.method === "POST") {
    const { temperature, humidity } = req.body;

    latestData = {
      temperature,
      humidity,
    };

    return res.status(200).json({ status: "success" });
  }

  // React ambil data
  if (req.method === "GET") {
    return res.status(200).json(latestData);
  }

  res.status(405).json({ message: "Method not allowed" });
}
