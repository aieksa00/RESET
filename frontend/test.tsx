import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import React from 'react';
import ReactDOM from 'react-dom/client';

const query = gql`{
  incidentApproveds(first: 5) {
    id
    requestId
    incidentAddress
    protocolName
  }
  incidentRequesteds(first: 5) {
    id
    requestId
    creator
    blockNumber
  }
}`
const url = 'https://api.studio.thegraph.com/query/81943/reset/version/latest'
const headers = { Authorization: 'Bearer 9f0f0cd72bc02f28154f9c0b2756a828' }

export default function App() {
  const { data, status } = useQuery({
    queryKey: ['data'],
    async queryFn() {
      return await request(url, query, {}, headers)
    }
  })
  return (
    <main>
      {status === 'pending' ? <div>Loading...</div> : null}
      {status === 'error' ? <div>Error ocurred querying the Subgraph</div> : null}
      <div>{JSON.stringify(data ?? {})}</div>
    </main>
  )
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);