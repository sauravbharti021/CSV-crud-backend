const express= require('express')
const router = new express.Router()
const controllers = require('./../controllers/UsersControllers')

const upload = require('../multerConfig/StorageConfig')

// Register
router.post("/user/register", upload.single("profile_picture"),  controllers.userpost)

router.get("/user/details", controllers.userget)

router.get("/user/:id", controllers.singleUserGet)

router.put("/user/edit/:id", upload.single("profile_picture"), controllers.userEdit)

router.delete("/user/delete/:id", controllers.deleteUser)

router.put("/user/status/:id", controllers.updateStatus)

router.get("/userexport", controllers.userExport)

module.exports = router