router.get('/responses/:requestId/last/:bloodGroup', async (req, res) => {
  try {
    const { requestId, bloodGroup } = req.params;
    const lastResponse = await DonorResponse.findOne({ requestId, bloodGroup })
      .sort({ responseTime: -1 });
    if (!lastResponse) {
      return res.status(404).json({
        success: false,
        message: 'No responses found for this request and blood group'
      });
    }
    res.json({
      success: true,
      response: lastResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch last donor response',
      error: error.message
    });
  }
});