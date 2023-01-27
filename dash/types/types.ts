export type KVData = {
  key: string;
  value: string;
  status?: Status;
};

const StatusItems = ["PENDING", "SUCCESS", "FAIL", "NEUTRAL"];
export type Status = typeof StatusItems[number];

export type KVList = {
  name: string;
}[];
