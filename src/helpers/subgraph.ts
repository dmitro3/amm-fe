// eslint-disable-next-line
export async function querySubGraph(query: any): Promise<any> {
  const url = process.env.REACT_APP_SUBGRAPH || '';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const json = await response.json();
  return json?.data;
}
