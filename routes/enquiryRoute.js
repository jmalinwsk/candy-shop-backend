const {
    createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    getEnquiry,
    getAllenquiries,
    getEnquiries
} = require("../controllers/enquiryController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", createEnquiry);
router.put("/:id", authMiddleware, isAdmin, updateEnquiry);
router.delete("/:id", authMiddleware, isAdmin, deleteEnquiry);
router.get("/:id", getEnquiry);
router.get("/", getEnquiries);

module.exports = router;