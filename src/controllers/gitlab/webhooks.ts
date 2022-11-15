export const gitLabWebhooks = (req, res) => {
  console.log(req.body);
  res.json({
    type: "OK"
  })
}
