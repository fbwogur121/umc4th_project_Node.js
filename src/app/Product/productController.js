const jwtMiddleware = require("../../../config/jwtMiddleware");
const productProvider = require("../../app/Product/productProvider");
const productService = require("../../app/Product/productService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");

/**
 * API No. 6
 * API Name : 상품 등록
 * [POST] /app/products
 * body : photo, title, categoryIdx, price, content, addressType
 */
 exports.postProduct = async function (req, res) {
    /**
     * Body: phtoto, title, categoryIdx, price, content, addressType
     */
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const { photo, title, categoryIdx, price, content, addressType } = req.body;

    let savePrice = price;

    if (!title) return res.send(errResponse(baseResponse.EMPTY_TITLE));
    if (!categoryIdx) return res.send(errResponse(baseResponse.EMPTY_CATEGORYIDX));
    if (!content) return res.send(errResponse(baseResponse.EMPTY_CONTENT));
    if (!addressType) return res.send(errResponse(baseResponse.EMPTY_ADDRESSTYPE));

    if (["address", "subAddress"].indexOf(addressType) < 0) return res.send(errResponse(baseResponse.OUT_OF_RANGE_ADDRESSTYPE));
    if (!price) savePrice = 0;

    const productRespone = await productService.createProduct(userIdxFromJWT, photo, title, categoryIdx, savePrice, content, addressType);

    return res.send(productRespone);
};

/**
 * API No. 7
 * API Name : Get product categories
 * [GET] /app/product-categories
 */
exports.getProductCategories = async function (req, res) {
    const categoriesResult = await productProvider.provideProductCategories();
    return res.send(response(baseResponse.SUCCESS, categoriesResult));
};

/** 
 * API No. 8
 * API Name : Get products in range
 * [GET] /app/products
 * body : 
 */
exports.getProducts = async function(req, res) {
    const userIdxFromJwt = req.verifiedToken.userIdx;

    const range = req.query.range;
    let addressType = req.query["address-type"];
    console.log(range);
    console.log(addressType);

    if(addressType === "sub-address") addressType="subAddress";
    // const params = req.query;
    // const params = req.params;
    if(!range) return res.send(errResponse(baseResponse.EMPTY_SEARCH_RANGE));
    if(!addressType) return res.send(errResponse(baseResponse.EMPTY_ADDRESSTYPE));

    if(["address", "subaddress"].indexOf(addressType) < 0)
        return res.send(errResponse(baseResponse.OUT_OF_RANGE_ADDRESSTYPE));
    if(range<1 || range>3) return res.send(errResponse(baseResponse.OUT_OF_RANGE_SEARCH_RANGE));

    const getProductsResult = await productProvider.getProductsInRange(userIdxFromJwt, addressType, range);
    if(getProductsResult.length<1) return res.send(errResponse(baseResponse.PRODUCT_NONE));

    return res.send(response(baseResponse.SUCCESS, getProductsResult));
};

/** 
 * API No. 9
 * API Name : Get the product info
 * [GET] /app/products/:productIdx
 */
exports.getProduct = async function (req, res) {
    console.log("zz");
    console.log("zz2");
    const userIdxFromJWT = req.verifiedToken.userIdx; //조회 카운트
    const productIdx = req.params.productIdx;

    const isProductExist = await productProvider.checkProductExist(productIdx);
    if (!isProductExist.exist) return res.send(errResponse(baseResponse.NOT_EXIST_PRODUCT));

    const isOnSale = await productProvider.checkProductStatus(productIdx);
    if (["Y", "m"].indexOf(isOnSale.status) < 0) return res.send(errResponse(baseResponse.PRODUCT_STATUS_NOT_ON_SALE));

    // product info
    const productResult = await productProvider.getProductInfo(productIdx);
    if (productResult.status === "N") res.send(errResponse(baseResponse.PRODUCT_STATUS_DELETED));

    // views count
    //const addviewsResult = await productService.addProductViews(userIdxFromJWT,productIdx); //todo
    const viewsResult = await productProvider.getProductViews(productIdx);

    // likes count
    const likesResult = await productProvider.getProductLikes(productIdx);

    // chats count
    const chatsResult = await productProvider.getProductChats(productIdx);

    // 사진
    const photoObjcts = await productProvider.getProductPhotos(productIdx);
    const photoResult = [];
    for (obj of photoObjcts) photoResult.push(obj);

    const result = {};
    result.productInfo = productResult;
    result.viewsResult = viewsResult;
    result.likesResult = likesResult;
    result.chatsResult = chatsResult;
    result.photos = photoResult;

    return res.send(response(baseResponse.SUCCESS, result));

};

/** 
 * API No. 10
 * API Name : Update the product
 * [PATCH] /app/products/:productIdx
 */
exports.patchProduct = async function (req, res) {
    const userIdxFromJWT = req.verifiedToken.userIdx;
    const productIdx = req.params.productIdx;
    const { title, categoryIdx, price, content, addressType } = req.body;
    // 사진 수정 photos

    // 존재하는 상품 검사
    const isProductExist = await productProvider.checkProductExist(productIdx);
    if (!isProductExist.exist) return res.send(errResponse(baseResponse.NOT_EXIST_PRODUCT));

    // 상품 상태 검사
    const isOnSale = await productProvider.checkProductStatus(productIdx);
    if (isOnSale.status === "o") return res.send(errResponse(baseResponse.PRODUCT_STATUS_SOLD_OUT));
    if (isOnSale.status === "d") return res.send(errResponse(baseResponse.PRODUCT_STATUS_DELETED));

    // 작성자 토큰인지 검사
    const productInfo = await productProvider.getProductInfo(productIdx);
    if (userIdxFromJWT !== productInfo.sellerIdx) return res.send(errResponse(baseResponse.NOT_MATCHED_PRODUCT_WRITER_ID));

    const patchResponse = {};
    if (!(title || categoryIdx || price || content || addressType)) return res.send(errResponse(baseResponse.EMPTY_INFO_TO_UPDATE));
    // if (photos) {
    //     const patchPhotoResponse = await productService.patchPhoto(productIdx, photos);
    //     patchResponse.photo = patchPhotoResponse;
    // }
    if (title) {
        const patchTitleResponse = await productService.patchProductTitle(productIdx, title);
        patchResponse.title = patchTitleResponse;
    }
    if (categoryIdx) {
        const patchCategoryIdxResponse = await productService.patchProductCategoryIdx(productIdx, categoryIdx);
        patchResponse.categoryIdx = patchCategoryIdxResponse;
    }
    if (price) {
        const patchPriceResponse = await productService.patchProductPrice(productIdx, price);
        patchResponse.price = patchPriceResponse;
    }
    if (content) {
        const patchContentResponse = await productService.patchProductContent(productIdx, content);
        patchResponse.content = patchContentResponse;
    }
    if (addressType) {
        const patchAddressTypeResponse = await productService.patchProductLocation(userIdxFromJWT, productIdx, addressType);
        patchResponse.addressType = patchAddressTypeResponse;
    }

    return res.send(response(baseResponse.SUCCESS, patchResponse));
};

/** 
 * API No. 11
 * API Name : Get products in the category
 * [GET] /app/products/categories/:categoryIdx
 */
exports.getCategoryProducts = async function (req, res) {
    const userIdxFromJWT = req.verifiedToken.userIdx;
    const categoryIdx = req.params.categoryIdx;
    const range = req.query.range;
    let addressType = req.query["address-type"];
    if (addressType === "sub-address") addressType = "subAddress";

    if (!addressType) return res.send(errResponse(baseResponse.EMPTY_ADDRESSTYPE));
    if (range === undefined) return res.send(errResponse(baseResponse.EMPTY_SEARCH_RANGE));

    if (["address", "subAddress"].indexOf(addressType) < 0) return res.send(errResponse(baseResponse.OUT_OF_RANGE_ADDRESSTYPE));
    if (range < 1 || range > 3) return res.send(errResponse(baseResponse.OUT_OF_RANGE_SEARCH_RANGE));

    const getCategoryProductsResult = await productProvider.getCategoryProductsInRange(userIdxFromJWT, addressType, range, categoryIdx);
    if (getCategoryProductsResult.length < 1) return res.send(errResponse(baseResponse.NOT_EXIST_PRODUCT));

    return res.send(response(baseResponse.SUCCESS, getCategoryProductsResult));
};