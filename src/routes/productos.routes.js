import {Router} from 'express'
const router = Router()

import * as productsCntrl from '../controllers/products.controller';
import {authJwt} from '../middlewares'

router.post("/", [authJwt.verifyToken, authJwt.isAdmin ], productsCntrl.createProduct)

router.get("/", productsCntrl.getProduct)

router.get("/:productId", productsCntrl.getProductById)

router.put("/:productId", [authJwt.verifyToken, authJwt.isAdmin], productsCntrl.updateProductById)

router.delete("/:productId", productsCntrl.deleteProductById)


export default router;