export interface Sender {
  type: string,
  session: string,
  data: Data[]
}

export interface Receiver {
  type: string,
  session: string,
  data: Data[]
}

export interface Data {
  name: string,
  value: number
}