App.jsx;
import React, { useState } from "react";
import {
  Database,
  GitBranch,
  MessageSquare,
  Settings,
  Box,
  Network,
  Eye,
  RefreshCcw,
  User,
  Table,
  ArrowBigLeft,
} from "lucide-react";
import ErDiagram from "./ErDiagram";
import { useNavigate } from "react-router-dom";
import SidebarComponent from "./Components/SidebarComponent";
import SearchBar from "./Components/SearchBar";
import FilterBar from "./Components/FilterBar";
import AddEntityComponent from "./Components/AddEntity";

import { ReactFlowProvider } from "@xyflow/react";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [create, setCreate] = useState("");
  const [showTables, setShowTables] = useState(false);
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState({
    lob: null,
    subject: null,
    database: null,
    table: null,
  });

  // Centralized selection logic for both FilterBar and SearchBar
  const handleSelection = (path) => {
    setSelectedPath(path);
    setActiveTab("overview");
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "entities", label: "Entities", icon: Box },
    { id: "relationships", label: "Relationships", icon: Network },
    // { id: "versions", label: "Version Control", icon: GitBranch },
    // { id: "annotations", label: "Annotations", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const businessData = {
    "Branded Cards": {
      Accounts: {
        databases: {
          card_accounts_db: ["card_accounts"],
          card_profile_db: ["card_holders", "card_limits"],
        },
      },
      Payments: {
        databases: {
          card_payments_db: ["card_transactions"],
          transaction_db: ["payments", "authorizations"],
        },
      },
      Fraud: {
        databases: {
          fraud_detection_db: ["fraud_alerts"],
          security_db: ["suspicious_transactions", "blocked_cards"],
        },
      },
      Collections: {
        databases: {
          collections_db: ["collection_cases"],
          delinquency_db: ["payment_plans", "recovery_actions"],
        },
      },
    },
    CRS: {
      Customer: {
        databases: {
          crs_customer_db: ["customer_profiles"],
          profile_db: ["contact_info", "preferences"],
        },
      },
      Compliance: {
        databases: {
          crs_compliance_db: ["compliance_reports", "tax_reporting"],
          regulatory_db: ["regulatory_filings"],
        },
      },
      Risk: {
        databases: {
          crs_risk_db: ["risk_assessments"],
          assessment_db: ["credit_scores", "risk_factors"],
        },
      },
    },
    Deposits: {
      Accounts: {
        databases: {
          deposit_accounts_db: ["savings_accounts"],
          savings_db: ["checking_accounts", "account_balances"],
        },
      },
      "Money Movement": {
        databases: {
          transfer_db: ["transfers"],
          wire_db: ["wire_transfers", "ach_transactions"],
        },
      },
      Rate: {
        databases: {
          interest_rates_db: ["interest_rates"],
          pricing_db: ["rate_tiers", "promotional_rates"],
        },
      },
      Fees: {
        databases: {
          fee_structure_db: ["fee_schedule"],
          charges_db: ["account_fees", "fee_waivers"],
        },
      },
    },
    Investments: {
      Accounts: {
        databases: {
          investment_accounts_db: ["investment_accounts"],
          portfolio_db: ["portfolios", "holdings"],
        },
      },
      Risk: {
        databases: {
          investment_risk_db: ["risk_profiles"],
          market_risk_db: ["market_risks", "portfolio_risks"],
        },
      },
      Finance: {
        databases: {
          investment_finance_db: ["portfolio_valuations"],
          valuation_db: ["performance_metrics", "returns"],
        },
      },
    },
    "Personal Loan": {
      Accounts: {
        databases: {
          loan_accounts_db: ["loan_accounts"],
          borrower_db: ["borrower_profiles", "loan_terms"],
        },
      },
      Risk: {
        databases: {
          loan_risk_db: ["credit_assessments"],
          credit_db: ["default_risks", "loan_grades"],
        },
      },
      Collections: {
        databases: {
          loan_collections_db: ["delinquent_loans"],
          recovery_db: ["collection_efforts", "recovery_plans"],
        },
      },
      Servicing: {
        databases: {
          loan_servicing_db: ["loan_payments"],
          payment_db: ["payment_schedules", "servicing_records"],
        },
      },
    },
    Mortgage: {
      Accounts: {
        databases: {
          mortgage_accounts_db: ["mortgage_accounts"],
          property_db: ["property_details", "loan_documents"],
        },
      },
      Collateral: {
        databases: {
          collateral_db: ["property_collateral"],
          appraisal_db: ["appraisals", "collateral_valuations"],
        },
      },
      Servicing: {
        databases: {
          mortgage_servicing_db: ["mortgage_payments"],
          escrow_db: ["escrow_accounts", "servicing_transfers"],
        },
      },
      Risk: {
        databases: {
          mortgage_risk_db: ["loan_to_value"],
          ltv_db: ["mortgage_risks", "default_probabilities"],
        },
      },
    },
    Customer: {
      Customer: {
        databases: {
          customer_master_db: ["customer_master"],
          demographics_db: ["demographics", "customer_segments"],
        },
      },
      "Customer Communication": {
        databases: {
          communication_db: ["communications"],
          notification_db: ["notifications", "preferences"],
        },
      },
      Acquisitions: {
        databases: {
          acquisition_db: ["prospects"],
          prospect_db: ["acquisition_campaigns", "conversion_metrics"],
        },
      },
      Marketing: {
        databases: {
          marketing_db: ["campaigns"],
          campaign_db: ["customer_responses", "marketing_metrics"],
        },
      },
    },
    // Channel: {
    //   Channels: {
    //     databases: ["channel_db", "interaction_db"],
    //     tables: [
    //       "channel_interactions",
    //       "channel_preferences",
    //       "usage_patterns",
    //     ],
    //   },
    //   Operations: {
    //     databases: ["channel_ops_db", "performance_db"],
    //     tables: [
    //       "channel_performance",
    //       "operational_metrics",
    //       "efficiency_reports",
    //     ],
    //   },
    //   "Customer Communication": {
    //     databases: ["channel_comm_db", "message_db"],
    //     tables: ["channel_messages", "communication_logs", "response_tracking"],
    //   },
    // },
    // Others: {
    //   Reference: {
    //     databases: ["reference_db", "lookup_db"],
    //     tables: ["reference_data", "lookup_tables", "master_data"],
    //   },
    //   Compliance: {
    //     databases: ["general_compliance_db", "audit_db"],
    //     tables: ["compliance_records", "audit_trails", "regulatory_reports"],
    //   },
    //   Operations: {
    //     databases: ["operations_db", "workflow_db"],
    //     tables: ["operational_data", "workflow_instances", "process_metrics"],
    //   },
    //   Disputes: {
    //     databases: ["disputes_db", "resolution_db"],
    //     tables: ["dispute_cases", "resolution_actions", "dispute_outcomes"],
    //   },
    //   Complaints: {
    //     databases: ["complaints_db", "feedback_db"],
    //     tables: [
    //       "customer_complaints",
    //       "complaint_resolutions",
    //       "feedback_analysis",
    //     ],
    //   },
    //   Merchant: {
    //     databases: ["merchant_db", "transaction_processing_db"],
    //     tables: [
    //       "merchant_accounts",
    //       "merchant_transactions",
    //       "settlement_data",
    //     ],
    //   },
    //   "Account Promotions": {
    //     databases: ["promotions_db", "offers_db"],
    //     tables: [
    //       "promotional_offers",
    //       "account_promotions",
    //       "promotion_results",
    //     ],
    //   },
    // },
  };

  const databaseOverview = selectedPath.database
    ? {
        name: selectedPath.database,
        owner: "admin_user",
        location: "us-east-1",
        description: "This is a sample database for demonstration purposes.",
        createdDate: "2023-01-15",
        lastModifiedDate: "2024-05-30",
        numberOfTables:
          businessData[selectedPath.lob]?.[selectedPath.subject]?.databases?.[
            selectedPath.database
          ]?.length ||
          businessData[selectedPath.lob]?.[selectedPath.subject]?.tables
            ?.length ||
          0,
        totalSize: "1.2 GB",
      }
    : null;

  return (
    <div
      className={` min-h-screen min-w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans overflow-hidden flex flex-col`}
    >
      {create == "Entity" && (
        <>
          <div className="fixed inset-0 bg-black/40 z-20 pointer-events-auto"></div>
          <AddEntityComponent setCreate={setCreate} />
        </>
      )}
      {create == "Relationship" && (
        <>
          <div className="fixed inset-0 bg-black/40 z-20 pointer-events-auto"></div>
          <AddEntityComponent setCreate={setCreate} />
        </>
      )}
      <nav className="w-full h-20 bg-white/90 backdrop-blur-lg shadow-lg flex items-center justify-between px-10 rounded-b-3xl border-b border-indigo-100 z-10">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="text-white" size={28} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-blue-400 bg-clip-text text-transparent tracking-wide drop-shadow">
              DATABEE
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-base bg-white border border-gray-300 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-2 shadow-sm font-semibold"
          >
            <User size={18} />
            Logout
          </button>
          <button className="px-6 py-2 text-base bg-blue-400 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2 font-semibold">
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>
      </nav>
      {/* FilterBar */}
      <div className="flex-shrink-0 px-6 py-3">
        <FilterBar
          selectedPath={selectedPath}
          onSelect={handleSelection}
          setSelectedPath={setSelectedPath}
          businessData={businessData}
        />
      </div>

      <div
        className={`flex flex-1  px-4 pb-4 gap-4 ${
          create == "Entity" ? "pointer-events-none" : ""
        } `}
      >
        {/* Sidebar */}
        <div className=" min-w-[20rem] max-w-xs  bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl flex flex-col border border-indigo-100">
          <div className="border-b border-gray-200 p-3">
            <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-1">
              {sidebarItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-2 py-2 rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                      activeTab === item.id
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    style={{ minWidth: 0 }}
                  >
                    <Icon size={16} />
                    <span className=" max-w-[4.5rem]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-3 py-2 border-b border-gray-200">
            <div className="space-y-1">
              {sidebarItems.slice(3).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-2 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 p-3  overflow-y-auto min-h-0">
            <SidebarComponent
              activeTab={activeTab}
              selectedPath={selectedPath}
              create={create}
              setCreate={setCreate}
              businessData={businessData}
            />
          </div>
        </div>

        <div>
          {selectedPath.database != null ? (
            selectedPath.table != null ? (
              <div className="w-[24rem]   bg-white h-full rounded-2xl shadow-2xl p-7 flex flex-col gap-5  animate-fade-in">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-gradient-to-br bg-blue-600 rounded-xl p-2 flex items-center justify-center shadow-lg">
                    <Table className="text-white" size={36} />
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-2xl  font-extrabold bg-blue-600 bg-clip-text text-transparent tracking-wide drop-shadow">
                      Table Overview
                    </h2>
                    <div className=" hover:text-blue-700 cursor-pointer transition-all">
                      <ArrowBigLeft
                        size={32}
                        onClick={() =>
                          setSelectedPath({
                            ...selectedPath,
                            table: null,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[15px]">
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="font-semibold text-blue-700">Name:</span>
                    <span className="truncate text-base text-gray-800 font-bold">
                      {selectedPath.table}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Owner:</span>
                    <span className="ml-1 text-gray-700">admin_user</span>
                  </div>
                  <div>
                    <span className="font-semibold">Storage Format:</span>
                    <span className="ml-1 text-gray-700">Parquet</span>
                  </div>
                  <div>
                    <span className="font-semibold">Row Count:</span>
                    <span className="ml-1 text-gray-700">100,000</span>
                  </div>
                  <div>
                    <span className="font-semibold">Column Count:</span>
                    <span className="ml-1 text-gray-700">10</span>
                  </div>
                  <div>
                    <span className="font-semibold">Partitions:</span>
                    <span className="ml-1 text-gray-700">10</span>
                  </div>
                  <div>
                    <span className="font-semibold">Last Modified:</span>
                    <span className="ml-1 text-gray-700">2024-05-30</span>
                  </div>
                  <div>
                    <span className="font-semibold">Description:</span>
                    <span className="ml-1 text-gray-700">
                      Sample table for demonstration.
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Created By:</span>
                    <span className="ml-1 text-gray-700">admin_user</span>
                  </div>
                  <div>
                    <span className="font-semibold">Table Type:</span>
                    <span className="ml-1 text-gray-700">Managed</span>
                  </div>
                  <div>
                    <span className="font-semibold">Access Type:</span>
                    <span className="ml-1 text-gray-700">Read/Write</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button className="w-full py-2 rounded-lg bg-gradient-to-r bg-blue-600 hover:bg-blue-400  text-white font-semibold shadow cursor-pointer transition-all">
                    View Columns
                  </button>
                  <button className="w-full py-2 rounded-lg bg-gradient-to-r bg-blue-600 hover:bg-blue-400 text-white font-semibold shadow cursor-pointer transition-all">
                    View Partitions
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-[24rem]   bg-white h-full rounded-2xl shadow-2xl p-7 flex flex-col gap-5  animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-br bg-blue-600 rounded-xl p-2 flex items-center justify-center shadow-lg">
                    <Database className="text-white " size={36} />
                  </div>
                  <h2 className="text-2xl font-extrabold  bg-blue-700  bg-clip-text text-transparent tracking-wide drop-shadow">
                    Database Overview
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[15px]">
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="font-semibold text-blue-700">Name:</span>
                    <span className="truncate">{databaseOverview.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Owner:</span>
                    <span className="ml-1 text-gray-700">
                      {databaseOverview.owner}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Location:</span>
                    <span className="ml-1 text-gray-700">
                      {databaseOverview.location}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Description:</span>
                    <span className="ml-1 text-gray-700">
                      {databaseOverview.description}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Created:</span>
                    <span className="ml-1 text-gray-700">
                      {databaseOverview.createdDate}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Last Modified:</span>
                    <span className="ml-1 text-gray-700">
                      {databaseOverview.lastModifiedDate}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">No. of Tables:</span>
                    <span className="ml-1 text-gray-700">
                      {databaseOverview.numberOfTables}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Total Size:</span>
                    <span className="ml-1 text-gray-700">
                      {databaseOverview.totalSize}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => setShowTables((val) => !val)}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-400 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    {showTables ? "Hide Tables" : "Show Tables"}
                  </button>
                </div>
                {showTables ? (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Tables in {databaseOverview.name}:
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      {businessData[selectedPath.lob]?.[
                        selectedPath.subject
                      ]?.databases?.[selectedPath.database]?.map((table) => (
                        <li
                          key={table}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 transition-all shadow cursor-pointer group"
                          onClick={() => {
                            setSelectedPath({ ...selectedPath, table });
                          }}
                        >
                          <Table
                            className="text-blue-600 group-hover:text-indigo-700"
                            size={20}
                          />
                          <span className="font-semibold text-gray-800 group-hover:text-indigo-900">
                            {table}
                          </span>
                          <span className="ml-auto text-xs text-gray-500 group-hover:text-indigo-700">
                            View
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )
          ) : null}
        </div>
        <div className="flex-1  flex flex-col items-center p-0 min-h-0">
          <div className="w-full  max-w-[1600px] mb-2 shrink-0">
            <SearchBar businessData={businessData} onSelect={handleSelection} />
          </div>
          <div
            className="w-full max-w-[1600px] flex-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-auto flex flex-col"
            style={{ minHeight: 0, minWidth: 0 }}
          >
            <ReactFlowProvider>
              <ErDiagram />
            </ReactFlowProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
