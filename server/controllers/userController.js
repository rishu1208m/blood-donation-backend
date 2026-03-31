exports.getNearbyDonors = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        const donors = await User.find({
            role: "donor",
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: 5000
                }
            }
        });

        res.json(donors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};