// src/apollo.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core'

// Define the GraphQL endpoint (PokéAPI GraphQL)
const httpLink = new HttpLink({
  uri: 'https://beta.pokeapi.co/graphql/v1beta',
})

// Create the Apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

export default apolloClient
