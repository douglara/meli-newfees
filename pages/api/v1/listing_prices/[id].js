
export async function getStaticPaths() {
  return {
    fallback: 'blocking'
  }
}

async function listing_prices(request,response) {
  const category_id = request.query.id;
  const category_id_only_numbers = category_id.replace(/\D/g,'');

  const category_on_meli_request = await fetch(`https://api.mercadolibre.com/sites/MLB/listing_prices?price=100&category_id=${category_id}`)
  if (category_on_meli_request.status != 200) {
    return response.json({
      message: "Category_id parameter is invalid",
      error: "bad_request",
    });
  }

  const category_on_meli = await category_on_meli_request.json()

  response.json({
    id: category_id,
    current_fees: category_on_meli,
    new_fees: get_new_fees(category_id_only_numbers),
    old_fees: get_old_fees(category_id)
  });
}

function get_old_fees(category_id) {
  const old_fees_json = require('../../../../files/old_fees.json');
  const old_fees = old_fees_json[`${category_id}`]
  if (old_fees === undefined){
    return null
  }
  return old_fees
}


function get_new_fees(category_id_only_numbers) {
  const new_fees_json = require('../../../../files/new_fees.json');
  const search = new_fees_json.ML.categoriesFromFile.filter(it => it.L7 === `${category_id_only_numbers}`)[0];
  if (search === undefined) {
    return null
  }

  var new_fees_filter = category_on_meli.filter(field => (field.listing_type_id === 'gold_pro' || field.listing_type_id === 'gold_special'));
  var new_fees = new_fees_filter.map(hash => {

    const new_hash = { ...hash }
    if (new_hash.listing_type_id === 'gold_pro') {
      new_hash.sale_fee_amount = +search.Premium
    }
    else {
      new_hash.sale_fee_amount = +search.Clasica
    }
    return new_hash
  });
  return new_fees
}


export default listing_prices;