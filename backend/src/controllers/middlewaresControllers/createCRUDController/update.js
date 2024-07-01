const update = async (Model, req, res) => {

  const result = await Model.findOneAndUpdate({_id:req.params.id},{$set:req.body}).exec();

  return res.status(200).json({
    success: true,
    result: result,
    message: 'Successfully updated the document in Model ',
  });
};

module.exports = update;
