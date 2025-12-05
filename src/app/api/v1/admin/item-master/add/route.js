import { NextResponse } from 'next/server'

import connectMongoDB from '@/libs/mongodb'
import { create_UUID, verifyAccessToken } from '@/helper/clientHelper'
import { ItemMaster } from '@/models/ItemMasterModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const {
    product_code,
    product_name,
    item_type,
    product_category,
    uom,
    basePrice,
    mrp,
    gst,
    distributorPrice,
    stock,
    warranty_available,
    product_status,
    service_code,
    service_name,
    service_category,
    service_type,
    service_duration,
    service_charge,
    hsn,
    selling_price,
    warranty_on_service,
    service_status,
    license_code,
    license_name,
    license_category,
    license_key,
    license_validity,
    license_price,
    license_renewal_price,
    no_of_users,
    activation_type,
    subscription_included,
    license_status,
    warranty_code,
    warranty_plan,
    warranty_covered_product,
    coverage_type,
    warranty_duration,
    warranty_cost,
    warranty_provider,
    warranty_claim_limits,
    warranty_expiry_date,
    warranty_status,
    subscription_code,
    subscription_name,
    plan_type,
    billing_cycle,
    subscription_price,
    subscription_renewal_price,
    auto_renewal_price,
    no_of_devices,
    subscription_start_date,
    subscription_end_date,
    subscription_status,
    description,
    Id,
    n_status
  } = await request.json()

  const verified = verifyAccessToken()
  const organizationId = verified?.data?.organization_id

  if (verified.success) {
    try {
      await connectMongoDB()

      if (Id) {
        const ItemId = await ItemMaster.findOne({
          _id: Id
        })

        if (ItemId === null) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter valid id!'
          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          const body = {
            product_code: product_code,
            product_name: product_name,
            item_type,
            product_category: product_category ? product_category : '',
            uom: uom ? uom : '',
            basePrice: basePrice ? basePrice : '',
            mrp: mrp ? mrp : '',
            gst: gst ? gst : '',
            distributorPrice: distributorPrice ? distributorPrice : '',
            stock: stock ? stock : '',
            warranty_available: warranty_available,
            product_status: product_status,
            service_code: service_code ? service_code : '',
            service_name: service_name ? service_name : '',
            service_category: service_category ? service_category : '',
            service_type: service_type ? service_type : '',
            service_duration: service_duration ? service_duration : '',
            service_charge: service_charge ? service_charge : '',
            hsn: hsn ? hsn : '',
            selling_price: selling_price ? selling_price : '',
            warranty_on_service: warranty_on_service ? warranty_on_service : '',
            service_status: service_status ? service_status : '',
            license_code: license_code ? license_code : '',
            license_name: license_name ? license_name : '',
            license_category: license_category ? license_category : '',
            license_key: license_key ? license_key : '',
            license_validity: license_validity ? license_validity : '',
            license_price: license_price ? license_price : '',
            license_renewal_price: license_renewal_price ? license_renewal_price : '',
            no_of_users: no_of_users ? no_of_users : '',
            activation_type: activation_type ? activation_type : '',
            subscription_included: subscription_included ? subscription_included : '',
            license_status: license_status ? license_status : '',
            warranty_code: warranty_code ? warranty_code : '',
            warranty_plan: warranty_plan ? warranty_plan : '',
            warranty_covered_product: warranty_covered_product ? warranty_covered_product : '',
            coverage_type: coverage_type ? coverage_type : '',
            warranty_duration: warranty_duration ? warranty_duration : '',
            warranty_cost: warranty_cost ? warranty_cost : '',
            warranty_provider: warranty_provider ? warranty_provider : '',
            warranty_claim_limits: warranty_claim_limits ? warranty_claim_limits : '',
            warranty_expiry_date: warranty_expiry_date ? warranty_expiry_date : '',
            warranty_status: warranty_status ? warranty_status : '',
            subscription_code: subscription_code ? subscription_code : '',
            subscription_name: subscription_name ? subscription_name : '',
            plan_type: plan_type ? plan_type : '',
            billing_cycle: billing_cycle ? billing_cycle : '',
            subscription_price: subscription_price ? subscription_price : '',
            subscription_renewal_price: subscription_renewal_price ? subscription_renewal_price : '',
            auto_renewal_price: auto_renewal_price ? auto_renewal_price : '',
            no_of_devices: no_of_devices ? no_of_devices : '',
            subscription_start_date: subscription_start_date ? subscription_start_date : '',
            subscription_end_date: subscription_end_date ? subscription_end_date : '',
            subscription_status: subscription_status ? subscription_status : '',
            description: description ? description : '',
            n_status: n_status,
            c_updatedBy: verified?.data?.user_id
          }
          await ItemMaster.findByIdAndUpdate(Id, body)
            .then(() => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Updated Successfully!'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            })
            .catch(err => {
              sendResponse['appStatusCode'] = 4
              sendResponse['message'] = 'Invalid Id'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = err
            })
          return NextResponse.json(sendResponse, { status: 200 })
        }
      } else {
        
        const itemValue = await ItemMaster.findOne({
          organization_id: organizationId,
          product_name: product_name
        })
        if (item_type === "Product" && product_code === '') {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter product code!'
          return NextResponse.json(sendResponse, { status: 200 })
        } else if (item_type === "Product" && itemValue) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = ' Item value already exist'
          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          let itemValue = new ItemMaster({
            item_id: create_UUID(),
            organization_id: organizationId,
            product_code: product_code,
            product_name: product_name,
            item_type,
            product_category: product_category ? product_category : '',
            uom: uom ? uom : '',
            basePrice: basePrice ? basePrice : '',
            mrp: mrp ? mrp : '',
            gst: gst ? gst : '',
            distributorPrice: distributorPrice ? distributorPrice : '',
            stock: stock ? stock : '',
            warranty_available: warranty_available,
            product_status: product_status,
            service_code: service_code ? service_code : '',
            service_name: service_name ? service_name : '',
            service_category: service_category ? service_category : '',
            service_type: service_type ? service_type : '',
            service_duration: service_duration ? service_duration : '',
            service_charge: service_charge ? service_charge : '',
            hsn: hsn ? hsn : '',
            selling_price: selling_price ? selling_price : '',
            warranty_on_service: warranty_on_service ? warranty_on_service : '',
            service_status: service_status ? service_status : '',
            license_code: license_code ? license_code : '',
            license_name: license_name ? license_name : '',
            license_category: license_category ? license_category : '',
            license_key: license_key ? license_key : '',
            license_validity: license_validity ? license_validity : '',
            license_price: license_price ? license_price : '',
            license_renewal_price: license_renewal_price ? license_renewal_price : '',
            no_of_users: no_of_users ? no_of_users : '',
            activation_type: activation_type ? activation_type : '',
            subscription_included: subscription_included ? subscription_included : '',
            license_status: license_status ? license_status : '',
            warranty_code: warranty_code ? warranty_code : '',
            warranty_plan: warranty_plan ? warranty_plan : '',
            warranty_covered_product: warranty_covered_product ? warranty_covered_product : '',
            coverage_type: coverage_type ? coverage_type : '',
            warranty_duration: warranty_duration ? warranty_duration : '',
            warranty_cost: warranty_cost ? warranty_cost : '',
            warranty_provider: warranty_provider ? warranty_provider : '',
            warranty_claim_limits: warranty_claim_limits ? warranty_claim_limits : '',
            warranty_expiry_date: warranty_expiry_date ? warranty_expiry_date : '',
            warranty_status: warranty_status ? warranty_status : '',
            subscription_code: subscription_code ? subscription_code : '',
            subscription_name: subscription_name ? subscription_name : '',
            plan_type: plan_type ? plan_type : '',
            billing_cycle: billing_cycle ? billing_cycle : '',
            subscription_price: subscription_price ? subscription_price : '',
            subscription_renewal_price: subscription_renewal_price ? subscription_renewal_price : '',
            auto_renewal_price: auto_renewal_price ? auto_renewal_price : '',
            no_of_devices: no_of_devices ? no_of_devices : '',
            subscription_start_date: subscription_start_date ? subscription_start_date : '',
            subscription_end_date: subscription_end_date ? subscription_end_date : '',
            subscription_status: subscription_status ? subscription_status : '',
            description: description ? description : '',
            n_status: n_status,
            c_createdBy: verified.data.user_id
          })

          await itemValue.save().then(() => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Product added Successfully!'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            })
            .catch(err => {
              sendResponse['appStatusCode'] = 4
              sendResponse['message'] = ''
              sendResponse['payloadJson'] = []
              sendResponse['error'] = err
            })

          return NextResponse.json(sendResponse, { status: 200 })
        }
      }
    } catch (err) {
      sendResponse['appStatusCode'] = 4
      sendResponse['message'] = ''
      sendResponse['payloadJson'] = []
      sendResponse['error'] = 'Something went wrong!'

      return NextResponse.json(sendResponse, { status: 400 })
    }
  } else {
    sendResponse = {
      appStatusCode: 4,
      message: [],
      payloadJson: [],
      error: verified.error
    }
    return NextResponse.json(sendResponse, { status: 400 })
  }
}
