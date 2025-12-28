import fetch from "node-fetch";

const SHOP = "jr-billionarie.myshopify.com";
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

export async function getProducts() {
  const query = `
  {
    products(first: 10) {
      edges {
        node {
          id
          title
          description
          handle
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }`;

  const response = await fetch(
    `https://${SHOP}/api/2024-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Storefront-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );

  return response.json();
}
