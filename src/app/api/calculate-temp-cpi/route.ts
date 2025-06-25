import { connectDB } from "@/lib/db/cpimongo";
import { apiKeyMiddleware } from "@/middleware/apiKeymiddleware";
import { NextRequest, NextResponse } from "next/server";
import { cacheExchange, createClient, fetchExchange, gql } from "urql";
import { ethers } from "ethers";
import { Parser } from "json2csv";
import * as fs from "fs";
import * as path from "path";

type CouncilPercentages = Record<string, number>;
interface CouncilPercentage {
  active: number;
  inactive: number;
  redistributed: Record<string, number>;
  originalPercentages: Record<string, number>;
}

interface DateRange {
  start_date: string;
  end_date: string;
  HCC: Set<string>;
}

const dateRanges: DateRange[] = [
  {
    start_date: "2022-05-26",
    end_date: "2023-01-25",
    HCC: new Set(["th_vp", "ch_vp_r2"]),
  },
  {
    start_date: "2023-01-26",
    end_date: "2023-03-30",
    HCC: new Set(["th_vp", "ch_vp_r2", "gc_vp_s3"]),
  },
  {
    start_date: "2023-03-31",
    end_date: "2023-06-07",
    HCC: new Set(["th_vp", "ch_vp_r3", "gc_vp_s3"]),
  },
  {
    start_date: "2023-06-08",
    end_date: "2024-01-03",
    HCC: new Set(["th_vp", "ch_vp_r3", "gc_vp_s4"]),
  },
  {
    start_date: "2024-01-04",
    end_date: "2024-01-11",
    HCC: new Set([
      "th_vp",
      "ch_vp_r3",
      "gc_vp_s5",
      "gc_vp_mm_s5",
      "sc_vp_s5",
      "coc_vp_s5",
      "dab_vp_s5",
    ]),
  },
  {
    start_date: "2024-01-12",
    end_date: "2024-06-26",
    HCC: new Set([
      "th_vp",
      "ch_vp_r4",
      "gc_vp_s5",
      "gc_vp_mm_s5",
      "sc_vp_s5",
      "coc_vp_s5",
      "dab_vp_s5",
    ]),
  },
  {
    start_date: "2024-06-27",
    end_date: "2024-07-16",
    HCC: new Set([
      "th_vp",
      "ch_vp_r4",
      "gc_vp_s6",
      "gc_vp_mm_s6",
      "sc_vp_s6",
      "coc_vp_s6",
      "dab_vp_s6",
    ]),
  },
  {
    start_date: "2024-07-17",
    end_date: "2024-10-21",
    HCC: new Set([
      "th_vp",
      "ch_vp_r5",
      "gc_vp_s6",
      "gc_vp_mm_s6",
      "sc_vp_s6",
      "coc_vp_s6",
      "dab_vp_s6",
    ]),
  },
  {
    start_date: "2024-10-22",
    end_date: "2025-01-15",
    HCC: new Set([
      "th_vp",
      "ch_vp_r6",
      "gc_vp_s6",
      "gc_vp_mm_s6",
      "sc_vp_s6",
      "coc_vp_s6",
      "dab_vp_s6",
    ]),
  },
  {
    start_date: "2025-01-16",
    end_date: "2025-07-23",
    HCC: new Set([
      "th_vp",
      "ch_vp_r7",
      "gc_vp_s7",
      "gc_vp_op_s7",
      "sc_vp_s7",
      "dab_vp_s7",
      "mmc_vp_s7"
    ]),
  },
];

interface CouncilMapping {
  displayName: string;
  keys: string[];
}

const councilMappings: CouncilMapping[] = [
  {
    displayName: "Token House",
    keys: ["th_vp"],
  },
  {
    displayName: "Citizen House",
    keys: ["ch_vp_r2", "ch_vp_r3", "ch_vp_r4", "ch_vp_r5", "ch_vp_r6","ch_vp_r7"],
  },
  {
    displayName: "Grants Council",
    keys: ["gc_vp_s3", "gc_vp_s4", "gc_vp_s5", "gc_vp_s6", "gc_vp_s7"],
  },
  {
    displayName: "Grants Council (Milestone & Metrics Sub-committee)",
    keys: ["gc_vp_mm_s5", "gc_vp_mm_s6"],
  },
  {
    displayName: "Grants Council (Operations Sub-committee)",
    keys: ["gc_vp_op_s7"],
  },
  {
    displayName: "Security Council",
    keys: ["sc_vp_s5", "sc_vp_s6", "sc_vp_s7"],
  },
  {
    displayName: "Code of Conduct Council",
    keys: ["coc_vp_s5", "coc_vp_s6"],
  },
  {
    displayName: "Developer Advisory Board",
    keys: ["dab_vp_s5", "dab_vp_s6", "dab_vp_s7"],
  },
  {
    displayName: "Milestone & Metrics Council",
    keys: ["mmc_vp_s7"],
  }
];

async function exportDataToCsv(data: any[], updatedData: any[], date: string) {
  try {
    // Create a directory to store CSV files if it doesn't exist
    const csvDir = path.join(process.cwd(), "delegate-data-csvs");
    if (!fs.existsSync(csvDir)) {
      fs.mkdirSync(csvDir, { recursive: true });
    }

    // Define fields to include in the CSV
    const fields = [
      "delegate_id",
      "voting_power.vp",
      "voting_power.th_vp",
      "voting_power.ch_vp_r6",
      "voting_power.gc_vp_s6",
      "voting_power.gc_vp_mm_s6",
      "voting_power.ch_member_r6",
      "voting_power.gc_member_s6",
      "voting_power.coc_member_s6",
      "voting_power.coc_vp_s6",
      "voting_power.dab_member_s6",
      "voting_power.dab_vp_s6",
      "voting_power.sc_vp_s6",
    ];

    // Create CSV parser
    const parser = new Parser({ fields });

    // Export original data
    const originalCsvData = parser.parse(data);
    const originalCsvPath = path.join(csvDir, `original_data_${date}.csv`);
    fs.writeFileSync(originalCsvPath, originalCsvData);

    // Export updated data
    const updatedCsvData = parser.parse(updatedData);
    const updatedCsvPath = path.join(csvDir, `updated_data_${date}.csv`);
    fs.writeFileSync(updatedCsvPath, updatedCsvData);

    console.log(`CSV files exported for date: ${date}`);
  } catch (error) {
    console.error(`Error exporting CSV for date ${date}:`, error);
  }
}

async function getTokenBalance(
  tokenContractAddress: string,
  walletAddress: string,
  rpcUrl: string
) {
  // Create a provider for Optimism network
  // In v6, the provider creation is slightly different
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Minimal ABI for balanceOf function
  const minimalABI = [
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  try {
    // Create contract instance
    // In v6, contract instantiation is more straightforward
    const tokenContract = new ethers.Contract(
      tokenContractAddress,
      minimalABI,
      provider
    );

    // Call balanceOf function
    // Slight syntax change in v6
    const balance = await tokenContract.balanceOf(walletAddress);

    // Format balance (similar to v5, but with slightly different syntax)
    const formattedBalance = ethers.formatUnits(balance, 18);

    return formattedBalance;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    throw error;
  }
}

let cachedClient: any = null;
let cachedDb: any = null;

function calculateCPI(
  data: any[],
  percentages: CouncilPercentages,
  redistributedPercentages: Record<string, number>,
  activeCouncils: Set<string>
): number {
  // First, validate the input data
  if (!data || data.length === 0) {
    return 0;
  }

  const parseVotingPower = (value: any): number => {
    // Handle undefined, null, or invalid values
    if (value === undefined || value === null) return 0;

    // Convert to string and clean any potential invalid characters
    const strValue = value.toString().trim();
    if (!strValue) return 0;

    // Parse the value and handle NaN
    const parsed = parseFloat(strValue);
    if (isNaN(parsed)) return 0;

    // Return with fixed precision
    return Number(parsed.toFixed(10));
  };

  return data.reduce((sum, delegate) => {
    // Ensure delegate and voting_power exist
    if (!delegate || !delegate.voting_power) {
      return sum;
    }

    let influence = 0;
    for (const council of activeCouncils) {
      // Safe access to voting power
      const votingPower = parseVotingPower(
        delegate.voting_power?.[council]
      );

      // Find council mapping and get percentage safely
      const councilMapping = councilMappings.find(m => m.keys.includes(council));
      const displayName = councilMapping?.displayName || "";
      const percentage = redistributedPercentages[displayName] || 0;

      // Calculate influence with safe values
      influence += (votingPower * percentage) / 100;
    }

    // Ensure influence is a valid number before squaring
    return sum + (isNaN(influence) ? 0 : Math.pow(influence, 2));
  }, 0);
}

function getActiveCouncils(date: Date): Set<string> {
  const dateString = date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
  for (const range of dateRanges) {
    if (dateString >= range.start_date && dateString <= range.end_date) {
      return range.HCC;
    }
  }
  return new Set();
}

function calculateCouncilPercentages(
  activeCouncils: Set<string>,
  percentages: Record<string, number>
): CouncilPercentage {
  let activeTotal = 0;
  let inactiveTotal = 0;
  const activeCouncilsMap: Record<string, number> = {};
  const originalPercentages: Record<string, number> = {};

  for (const [council, percentage] of Object.entries(percentages)) {
    const percentageValue = Number(percentage);
    const mapping = councilMappings.find((m) => m.displayName === council);

    if (!mapping) continue;

    originalPercentages[council] = percentageValue;
    const isActive = mapping.keys.some((key: any) => activeCouncils.has(key));

    if (isActive) {
      activeTotal += percentageValue;
      activeCouncilsMap[council] = percentageValue;
    } else {
      inactiveTotal += percentageValue;
    }
  }

  const numberOfActiveCouncils = Object.keys(activeCouncilsMap).length;
  const redistributionPerCouncil =
    numberOfActiveCouncils > 0 ? inactiveTotal / numberOfActiveCouncils : 0;

  const redistributed: Record<string, number> = {};
  for (const [council, originalPercentage] of Object.entries(
    activeCouncilsMap
  )) {
    redistributed[council] = Number(
      (originalPercentage + redistributionPerCouncil).toFixed(2)
    );
  }

  return {
    active: Number(activeTotal.toFixed(2)),
    inactive: Number(inactiveTotal.toFixed(2)),
    redistributed,
    originalPercentages,
  };
}

class SimpleCache<T> {
  private cache: Map<string, { value: T; expiry: number }>;

  constructor() {
    this.cache = new Map();
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (item && Date.now() < item.expiry) {
      return item.value;
    }
    this.cache.delete(key);
    return undefined;
  }

  set(key: string, value: T, ttl: number): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }
}

const cache = new SimpleCache<any>();
const CACHE_DURATION = 5 * 60 * 1000; // 1 hour in milliseconds

async function getUniqueDates(db: any): Promise<Date[]> {
  const cachedDates = cache.get("uniqueDates");
  if (cachedDates) {
    return cachedDates;
  }

  const dates = await db
    .collection("delegate_data")
    .aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id" } },
    ])
    .toArray();

  const formattedDates = dates.map((d: any) => d.date);
  cache.set("uniqueDates", formattedDates, CACHE_DURATION);
  return formattedDates;
}

async function getDelegateDataForDate(db: any, date: Date) {
  const cacheKey = `delegateData_${date.toISOString()}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const data = await db
    .collection("delegate_data")
    .find({ date: date })
    .project({
      voting_power: 1,
      delegate_id: 1,
      _id: 0,
    })
    .toArray();

  cache.set(cacheKey, data, CACHE_DURATION);
  return data;
}
const DELEGATE_CHANGED_QUERY = gql`
  query MyQuery($delegator: String!) {
    delegateChangeds(
      orderBy: blockTimestamp
      orderDirection: desc
      where: { delegator: $delegator }
      first: 1
    ) {
      toDelegate
    }
  }
`;
const op_client = createClient({
  url: "https://api.studio.thegraph.com/query/68573/op/v0.0.1",
  exchanges: [cacheExchange, fetchExchange],
});

// Define the GraphQL query
const FETCH_VOTE = gql`
  query MyQuery($delegate: String!) {
    delegateVotesChangeds(
      orderBy: blockTimestamp
      orderDirection: desc
      first: 1
      where: { delegate: $delegate }
    ) {
      newBalance
      delegate
    }
  }
`;
async function fetchVotingPower(db:any,addresses: string[]) {
  try {
    // Convert addresses to lowercase for case-insensitive comparison
    const normalizedAddresses = addresses?.map(addr => addr?.toLowerCase());

    // Fetch voting power for all addresses
    const results = await db.collection('delegate_data').aggregate([
      {
        $match: {
          delegate_id: {
            $in: normalizedAddresses
          }
        }
      },
      {
        $sort: {
          date: -1
        }
      },
      {
        $group: {
          _id: "$delegate_id",
          voting_power: { $first: "$voting_power.vp" }
        }
      }
    ]).toArray();

    // Create a map for quick lookup
    const votingPowerMap = results.reduce((acc:any, record:any) => {
      acc[record._id] = record.voting_power;
      return acc;
    }, {} as { [key: string]: number });

    // Return results in the same order as input addresses
    return normalizedAddresses.map(address =>
      votingPowerMap[address] || 0
    );

  } catch (error) {
    console.error('Error fetching voting power:', error);
    return addresses.map(() => 0);
  } 
}
export async function GET(request: NextRequest) {
  const keyData = await apiKeyMiddleware(request);
  console.log("keyData::::---", keyData);
  // If middleware returned a response, it means there was an error
  if (keyData instanceof NextResponse) {
    return keyData;
  }

  // Extract query parameters
  const { searchParams } = new URL(request.url);
  const delegatorAddress = searchParams.get("delegatorAddress");
  const toAddress = searchParams.get("toAddress");

  // Validate input addresses
  if (!delegatorAddress || !toAddress) {
    return NextResponse.json(
      { error: "Both fromAddress and toAddress are required" },
      { status: 400 }
    );
  }

  const OPTIMISM_RPC = process.env.JSON_RPC_URL!;
  const OP_TOKEN_ADDRESS = "0x4200000000000000000000000000000000000042";
  const walletAddress = delegatorAddress;
  let balance;
  try {
    balance = await getTokenBalance(
      OP_TOKEN_ADDRESS,
      walletAddress,
      OPTIMISM_RPC
    );
    console.log("Token Balance:", balance);
  } catch (error) {
    console.error("Failed to fetch balance:", error);
  }

  const data = await op_client.query(DELEGATE_CHANGED_QUERY, {
    delegator: delegatorAddress,
  });
  //   console.log('data:',data);
  const fromAddress = data.data.delegateChangeds[0]?.toDelegate;
  if (!fromAddress) {
    console.log("fromAddress not found");
  }
  // console.log('fromAddress:',fromAddress);
  let client;
  try {
    const oldpercentages = {
      "Token House": 32.33,
      "Citizen House": 34.59,
      "Grants Council": 10.15,
      "Grants Council (Milestone & Metrics Sub-committee)": 2.82,
      "Security Council": 12.78,
      "Code of Conduct Council": 4.32,
      "Developer Advisory Board": 3.01,
    } as CouncilPercentages;

    const percentages = {
      "Token House": 33.73,
      "Citizen House": 36.08,
      "Grants Council": 10.59,
      "Grants Council (Operations Sub-committee)": 0.19,
      "Security Council": 13.33,
      "Code of Conduct Council": 0.00,
      "Developer Advisory Board": 3.14,
      "Milestone & Metrics Council": 2.94
    } as CouncilPercentages;

    client = await connectDB();
    const db = client.db();
  const addresses = [fromAddress, toAddress];
  let votingPowersGlobal: any[] = []; // Declare a variable outside the function
  await fetchVotingPower(db,addresses).then((votingPowers) => {
    votingPowersGlobal = votingPowers.map((vp: string) =>
      (Number(vp)).toString()
    ); // Assign the result to the global variable
  });
  votingPowersGlobal = [...votingPowersGlobal, balance];

    const dates = await getUniqueDates(db);

    if (dates.length === 0) {
      console.error("No dates found in the collection");
      return NextResponse.json({ error: "No data available" }, { status: 404 });
    }

    const results = await Promise.all(
      dates.map(async (date) => {
        const activeCouncils = getActiveCouncils(new Date(date));
        let data = await getDelegateDataForDate(db, new Date(date));

        const addressesToUpdate = [
          {
            address: fromAddress?.toLowerCase(), // From address
            newVotingPower: fromAddress
              ? (
                Number(votingPowersGlobal[0]) - Number(votingPowersGlobal[2])
              ).toString()
              : "0", // New voting power
          },
          {
            address: toAddress.toLowerCase(), // To address (delegate recipient)
            newVotingPower: (
              Number(votingPowersGlobal[1]) + Number(votingPowersGlobal[2])
            ).toString(), // New voting power
          },
        ];
        console.log("addressesToUpdate", addressesToUpdate);
        const originalData = [...data];

        // Update voting power for specific addresses
        data = data.map((delegate: any) => {
          const updateMatch = addressesToUpdate.find(
            (update) =>
              update?.address?.toLowerCase() ===
              delegate.delegate_id.toLowerCase()
          );
          // console.log('updateMatch:', updateMatch);
          if (updateMatch) {
            console.log("updateMatch", updateMatch);
            console.log("delegate", delegate);
            return {
              ...delegate,
              voting_power: {
                ...delegate.voting_power,
                vp: updateMatch.newVotingPower,
                th_vp: delegate.voting_power.th_vp,
              },
            };
          }
          return delegate;
        });
        // Add missing addresses from addressesToUpdate
        addressesToUpdate.forEach((addressToUpdate) => {
          if (!addressToUpdate.address) return; // Skip if address is undefined
          const exists = data.some(
            (delegate: any) =>
              delegate.delegate_id.toLowerCase() === addressToUpdate.address.toLowerCase()
          );

          if (!exists) {
            data.push({
              delegate_id: addressToUpdate.address,
              voting_power: {
                vp: addressToUpdate.newVotingPower,
                th_vp: "0", // Default value for threshold voting power
              }
            });
          }
        });
        //   console.log('data:', data);
        // Recalculate total voting power after updates
        const totalVotingPower = data.reduce((sum: number, delegate: any) => {
          // console.log("delegate:", delegate);
          const votingPower = Number(delegate.voting_power.vp);
          return sum + (isNaN(votingPower) ? 0 : votingPower);
        }, 0);
        console.log("totalVotingPower:", totalVotingPower);
        // Recalculate delegate percentages
        const updatedData = data.map((delegate: any) => ({
          ...delegate,
          voting_power: {
            ...delegate.voting_power, // Spread the existing voting_power object
            th_vp: (delegate.voting_power.vp * 100) / totalVotingPower, // Calculate th_vp
          },
        }));
        // console.log('updatedData:', updatedData);
        if (updatedData.length === 0) {
          console.warn(`No data found for date: ${date}`);
          return null;
        }

        const councilPercentages = calculateCouncilPercentages(
          activeCouncils,
          percentages
        );

        const cpi = calculateCPI(
          updatedData, // Use updated data with modified voting powers
          percentages,
          councilPercentages.redistributed,
          activeCouncils
        );

        const activeRedistributed = Object.fromEntries(
          Object.entries(councilPercentages.redistributed).filter(([council]) =>
            councilMappings.some(
              (mapping) =>
                mapping.keys.some((key) => activeCouncils.has(key)) &&
                mapping.displayName === council
            )
          )
        );

        const dateString = new Date(date).toISOString().split("T")[0];
        // await exportDataToCsv(originalData, updatedData, dateString);
        return {
          date: dateString,
          cpi,
          activeCouncils: Array.from(activeCouncils),
          councilPercentages,
          activeRedistributed,
          filename: dateString,
          updatedAddresses: addressesToUpdate, // Optional: to track which addresses were modified
        };
      })
    );

    const filteredResults = results.filter((result) => result !== null);

    return NextResponse.json({ results: filteredResults });
  } catch (error) {
    console.error("Error calculating CPI:", error);
    return NextResponse.json(
      { error: "Failed to calculate CPI" },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.close();
        console.log("MongoDB connection closed successfully");
      } catch (error) {
        console.error("Error closing MongoDB connection:", error);
      }
    }
  }
}
