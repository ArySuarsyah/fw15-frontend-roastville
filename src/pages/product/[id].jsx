// product picture belum di set

import Header from "@/components/header"
import Footer from "@/components/footer"
import React, { useState } from "react"
import { IoIosArrowForward } from "react-icons/io"
import Image from "next/image"
import bg_detail from "public/bg-detail-product.jpg"
import { FiTrash2 } from "react-icons/fi"
import { useRouter } from "next/router"
import { useDispatch, useSelector } from "react-redux"
import { clearProduct } from "@/redux/reducers/product"
import { PURGE } from "redux-persist"

import { withIronSessionSsr } from "iron-session/next"
import checkCredentials from "@/helpers/checkCredentials"
import cookieConfig from "@/helpers/cookieConfig"
import { Formik } from "formik"
import http from "@/helpers/http"

export const getServerSideProps = withIronSessionSsr(async ({ req, res }) => {
  const token = req.session.token || null
  checkCredentials(token, res, "/auth/login")
  return {
    props: {
      token,
    },
  }
}, cookieConfig)


function DetailProduct({ token }) {
  const dispatch = useDispatch()
  const [editProduct, setEditProduct] = React.useState(false)
  const [product, setProduct] = React.useState([])
  const productDetail = useSelector((state) => state.product.data)
  const [count, setCount] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  function increment() {
    if (count >= 10) {
      setCount(10)
    } else {
      setCount(count + 1)
    }
  }

  function decrement() {
    if (count <= 0) {
      setCount(0)
    } else {
      setCount(count - 1)
    }
  }
  
  const router = useRouter()
  const { id } = router.query

  // React.useEffect(() => {
  //   async function getDataProduct(){
  //     const {data} = await http().get(`/product/${id}`)
  //     console.log(data)
  //     setProduct(data.result)
  //   }
  //   getDataProduct()
  // }, [id])

  React.useEffect(() => {
    if (!productDetail) {
      router.replace("/product")
    }
  }, [router, productDetail])

  const [selectedSize, setSelectedSize] = React.useState("")

  const selectSize = (event) => {
    const selectedValue = event.target.value

    if (selectedValue) {
      if (selectedValue === "Regular") {
        setSelectedSize(productDetail.variant[0].price)
      }
      if (selectedValue === "Large") {
        setSelectedSize(
          productDetail?.variant[1]?.price
            ? productDetail?.variant[1]?.price
            : productDetail?.variant[0]?.price
        )
      }
      if (selectedValue === "Extra Large") {
        setSelectedSize(
          productDetail?.variant[2]?.price
            ? productDetail?.variant[1]?.price
            : productDetail?.variant[0]?.price
        )
      }
    }
  }


  const editProductAdmin = async (values)=>{
    const form = new FormData()
    Object.keys(values).forEach((key) => {
      if (values[key]) {
          form.append(key, values[key])
      }
    })
    try{
      const data = await http(token).patch(`/products/manage/${id}`, form,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setProduct(data.result)
      console.log(data)
    }catch(err){
      console.log(err)
    }
    setEditProduct(false)
  }

  React.useEffect(() => {
    const handleChangeRouter = () => {
      dispatch({
        type: PURGE,
        key: "product",
        result: () => null,
      })
      dispatch(clearProduct)
    }
    router.events.on("routeChangeStart", handleChangeRouter)

    return () => {
      router.events.off("routeChangeStart", handleChangeRouter)
    }
  }, [dispatch, router.events])

  return (
    <div className="h-min-screen">
      <div className="pb-24 header">
        <Header token={token} />
      </div>
      <div className="h-[100%] px-24 py-8">
        <div className="flex h-full">
          <div className="flex w-[50%]">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex font-bold items-center text-[20px] ">
                Favourit & Promo <IoIosArrowForward size={30} />
                <div>name product</div>
              </div>
              <div className="h-[700px] relative ">
                <Image
                  src={bg_detail}
                  className="h-full w-full object-cover"
                  alt="bg-detail-product"
                />
                <label
                  htmlFor="deleteProduct"
                  className="absolute cursor-pointer top-10 right-10 bg-secondary h-14 w-14 rounded-full flex justify-center items-center"
                >
                  <FiTrash2 size={30} color="white" />
                </label>
              </div>
              <div className="w-[400px] text-[25px]  ">
                Delivery only{" "}
                <span className="font-bold text-[25px] ">
                  on Monday to friday at 1 - 7 pm
                </span>
              </div>
            </div>
          </div>
          <Formik
            initialValues={{
              name: productDetail?.name,
              description: productDetail?.description
            }}
            onSubmit={editProductAdmin}
            enableReinitialize
          >
            {({handleSubmit, handleChange, handleBlur, values }) =>(
              <form onSubmit={handleSubmit} className="flex flex-1  pl-12 pr-36 py-8 ">
                <div className="flex flex-col gap-4  w-full">
                  {!editProduct && <div className="font-bold text-[65px] ">{productDetail.name}</div>}
                  {editProduct && (
                    <input type="text" className="input input-ghost bg-transparent w-full max-w-xs" name="name"
                    onChange={handleChange} onBlur={handleBlur}  value={values.name}
                    />
                  )}
                  <div className="border-t-2 border-b-2 text-[40px] py-2">
                    {selectedSize ? selectedSize : productDetail.variant[0].price}
                  </div>
                  <div className="text-[25px]  font-semi-bold py-4 border-b-2 ">
                    {productDetail.description}
                  </div>
                  <div className="flex flex-col gap-8">
                    <div className="w-full h-24 pt-8">
                      <select
                        className="select select-primary w-full h-full text-[20px]"
                        onChange={selectSize}
                      >
                        <option disabled value="">
                          --Select Size--
                        </option>
                        <option value="Regular">Regular</option>
                        <option value="Large">Large</option>
                        <option value="Extra Large">Extra Large</option>
                      </select>
                    </div>
                    <div className="w-full pt-0 h-16 ">
                      <select className="select select-primary w-full h-full text-[20px] ">
                        <option disabled selected>
                          --Select Delivery Methods--
                        </option>
                        <option>Reguler</option>
                        <option>Large</option>
                        <option>Extra Large</option>
                      </select>
                    </div>
                    <div className="flex gap-4 w-full h-16">
                      <div className="h-full rounded-xl flex justify-between items-center w-[40%] border bordered-2 px-4">
                        <button className="p-2 text-[20px] ">-</button>
                        <div className="p-2">0</div>
                        <button className="p-2 text-[20px]">+</button>
                      </div>
                      <div className="flex flex-1 h-full ">
                        <button className="btn btn-secondary w-full h-full">
                          Add to Chart
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-16">
                      <button type="submit" className="btn btn-primary w-full h-full">
                        Save Change
                      </button>
                    </div>
                    <div className="w-full h-16">
                      <button type="button" className="btn btn-primary w-full h-full" onClick={()=> setEditProduct(true)}>
                        Edit Product
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      <Footer />
      <input type="checkbox" id="deleteProduct" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Alert!</h3>
          <p className="py-4">Are you sure want to delete this product</p>
          <div className="modal-action">
            <label
              htmlFor="deleteProduct"
              className="btn btn-error normal-case text-white cursor-pointer"
            >
              Yes!
            </label>
            <label
              htmlFor="deleteProduct"
              className="btn btn-success normal-case text-white cursor-pointer"
            >
              No!
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailProduct
