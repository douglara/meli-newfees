
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

  const new_fees_json = require('../../../../files/new_fees.json');
  const search = new_fees_json.ML.categoriesFromFile.filter(it => it.L7 === `${category_id_only_numbers}`)[0];
  var new_fees_filter = category_on_meli.filter(field => (field.listing_type_id === 'gold_pro' || field.listing_type_id === 'gold_special'));
  var new_fees = new_fees_filter.map(hash => {

    const new_hash = { ...hash }
    if (new_hash.listing_type_id === 'gold_pro') {
      new_hash.listing_type_id = +search.Premium
    }
    else {
      new_hash.listing_type_id = +search.Clasica
    }
    return new_hash
    });

  response.json({
    id: category_id,
    current_fees: category_on_meli,
    new_fees: new_fees
  });
}

export default listing_prices;