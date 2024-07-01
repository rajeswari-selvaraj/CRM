const mongoose = require('mongoose');
const Model = mongoose.model('Offer');

const custom = require('@/controllers/pdfController');

const { calculate } = require('@/helpers');
const { increaseBySettingKey } = require('@/middlewares/settings');

const update =  async (req, res) => {
  const { items = [], taxRate = 0, discount = 0 } = req.body;

  //{itemName: "axess", description: "web page", quantity: 2, price: 100, total: 200}
  // default
  let subTotal = 0;
  let taxTotal = 0;
  let total = 0;
  // let credit = 0;

  //Calculate the items array with subTotal, total, taxTotal
  items.map((item) => {
    let total = calculate.multiply(item['quantity'], item['price']);
    //sub total
    subTotal = calculate.add(subTotal, total);
    //item total
    item['total'] = total;
  });
  taxTotal = calculate.multiply(subTotal, taxRate / 100);
  total = calculate.add(subTotal, taxTotal);

  let body = req.body;

  body['subTotal'] = subTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = items;
  body['createdBy'] = req.admin._id;

  const fileId = 'offer-' + req.params.id + '.pdf';

  body.pdf=fileId;

  const updateResult = await Model.findOneAndUpdate(
    { _id: req.params.id },
    { $set: body }
  ).exec();
  // Returning successfull response

  increaseBySettingKey({
    settingKey: 'last_offer_number',
  });

  // Returning successfull response
  return res.status(200).json({
    success: true,
    result: updateResult,
    message: 'Offer Updated successfully',
  });
};
module.exports = update;
