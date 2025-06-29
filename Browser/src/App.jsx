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
} from "lucide-react";
import ErDiagram from "./ErDiagram";
import { useNavigate } from "react-router-dom";
import SidebarComponent from "./Components/SidebarComponent";
import SearchBar from "./Components/SearchBar";
import FilterBar from "./Components/FilterBar";
import { ReactFlowProvider } from "@xyflow/react";
// import AddEntityComponent from "./Components/AddEntity"; // Uncomment if you have this component

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [create, setCreate] = useState("");
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
    { id: "versions", label: "Version Control", icon: GitBranch },
    { id: "annotations", label: "Annotations", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // --- businessData: all databases are arrays of table names ---
  const businessData = {
    "Branded Cards": {
      Accounts: {
        databases: {
          card_accounts_db: [
            "card_accounts",
            "account_status",
            "card_issuance",
          ],
          card_profile_db: [
            "card_holders",
            "cardholder_details",
            "card_limits",
          ],
        },
      },
      Payments: {
        databases: {
          card_payments_db: [
            "card_transactions",
            "payment_history",
            "transaction_fees",
          ],
          transaction_db: ["payments", "authorizations", "settlement_records"],
        },
      },
      Fraud: {
        databases: {
          fraud_detection_db: [
            "fraud_alerts",
            "fraud_patterns",
            "risk_scoring",
          ],
          security_db: [
            "suspicious_transactions",
            "blocked_cards",
            "security_logs",
          ],
        },
      },
      Collections: {
        databases: {
          collections_db: [
            "collection_cases",
            "collector_assignments",
            "case_status",
          ],
          delinquency_db: [
            "payment_plans",
            "recovery_actions",
            "delinquent_accounts",
          ],
        },
      },
    },
    CRS: {
      Customer: {
        databases: {
          crs_customer_db: [
            "customer_profiles",
            "kyc_documents",
            "onboarding_data",
          ],
          profile_db: [
            "contact_info",
            "preferences",
            "communication_history",
          ],
        },
      },
      Compliance: {
        databases: {
          crs_compliance_db: [
            "compliance_reports",
            "audit_findings",
            "remediation_actions",
          ],
          regulatory_db: [
            "tax_reporting",
            "regulatory_filings",
            "compliance_calendar",
          ],
        },
      },
      Risk: {
        databases: {
          crs_risk_db: ["risk_assessments", "risk_models", "stress_testing"],
          assessment_db: ["credit_scores", "risk_factors", "portfolio_metrics"],
        },
      },
    },
    Deposits: {
      Accounts: {
        databases: {
          deposit_accounts_db: [
            "savings_accounts",
            "account_opening",
            "account_closure",
          ],
          savings_db: [
            "checking_accounts",
            "account_balances",
            "interest_calculations",
          ],
        },
      },
      "Money Movement": {
        databases: {
          transfer_db: [
            "transfers",
            "transfer_limits",
            "beneficiary_management",
          ],
          wire_db: [
            "wire_transfers",
            "ach_transactions",
            "international_transfers",
          ],
        },
      },
      Rate: {
        databases: {
          interest_rates_db: [
            "interest_rates",
            "rate_history",
            "rate_changes",
          ],
          pricing_db: ["rate_tiers", "promotional_rates", "pricing_models"],
        },
      },
      Fees: {
        databases: {
          fee_structure_db: [
            "fee_schedule",
            "fee_types",
            "fee_calculations",
          ],
          charges_db: ["account_fees", "fee_waivers", "fee_reversals"],
        },
      },
    },
    Investments: {
      Accounts: {
        databases: {
          investment_accounts_db: [
            "investment_accounts",
            "account_types",
            "tax_wrappers",
          ],
          portfolio_db: ["portfolios", "holdings", "asset_allocation"],
        },
      },
      Risk: {
        databases: {
          investment_risk_db: [
            "risk_profiles",
            "risk_tolerance",
            "risk_questionnaires",
          ],
          market_risk_db: ["market_risks", "portfolio_risks", "var_calculations"],
        },
      },
      Finance: {
        databases: {
          investment_finance_db: [
            "portfolio_valuations",
            "nav_calculations",
            "cost_basis",
          ],
          valuation_db: ["performance_metrics", "returns", "benchmarking"],
        },
      },
    },
    "Personal Loan": {
      Accounts: {
        databases: {
          loan_accounts_db: [
            "loan_accounts",
            "loan_applications",
            "approval_workflow",
          ],
          borrower_db: [
            "borrower_profiles",
            "loan_terms",
            "repayment_schedules",
          ],
        },
      },
      Risk: {
        databases: {
          loan_risk_db: [
            "credit_assessments",
            "underwriting_decisions",
            "risk_pricing",
          ],
          credit_db: ["default_risks", "loan_grades", "credit_bureau_data"],
        },
      },
      Collections: {
        databases: {
          loan_collections_db: [
            "delinquent_loans",
            "collection_strategies",
            "workout_plans",
          ],
          recovery_db: ["collection_efforts", "recovery_plans", "charge_offs"],
        },
      },
      Servicing: {
        databases: {
          loan_servicing_db: [
            "loan_payments",
            "payment_processing",
            "escrow_management",
          ],
          payment_db: ["payment_schedules", "servicing_records", "payment_history"],
        },
      },
    },
    Mortgage: {
      Accounts: {
        databases: {
          mortgage_accounts_db: [
            "mortgage_accounts",
            "loan_origination",
            "closing_documents",
          ],
          property_db: [
            "property_details",
            "loan_documents",
            "title_information",
          ],
        },
      },
      Collateral: {
        databases: {
          collateral_db: [
            "property_collateral",
            "collateral_tracking",
            "lien_management",
          ],
          appraisal_db: [
            "appraisals",
            "collateral_valuations",
            "property_inspections",
          ],
        },
      },
      Servicing: {
        databases: {
          mortgage_servicing_db: [
            "mortgage_payments",
            "payment_application",
            "loan_modifications",
          ],
          escrow_db: [
            "escrow_accounts",
            "servicing_transfers",
            "tax_insurance_payments",
          ],
        },
      },
      Risk: {
        databases: {
          mortgage_risk_db: [
            "loan_to_value",
            "mortgage_insurance",
            "risk_monitoring",
          ],
          ltv_db: ["mortgage_risks", "default_probabilities", "loss_given_default"],
        },
      },
    },
    Customer: {
      Customer: {
        databases: {
          customer_master_db: [
            "customer_master",
            "customer_hierarchy",
            "relationship_mapping",
          ],
          demographics_db: ["demographics", "customer_segments", "behavioral_data"],
        },
      },
      "Customer Communication": {
        databases: {
          communication_db: [
            "communications",
            "message_templates",
            "delivery_tracking",
          ],
          notification_db: ["notifications", "preferences", "opt_in_management"],
        },
      },
      Acquisitions: {
        databases: {
          acquisition_db: ["prospects", "lead_scoring", "conversion_tracking"],
          prospect_db: [
            "acquisition_campaigns",
            "conversion_metrics",
            "channel_attribution",
          ],
        },
      },
      Marketing: {
        databases: {
          marketing_db: ["campaigns", "campaign_performance", "a_b_testing"],
          campaign_db: ["customer_responses", "marketing_metrics", "roi_analysis"],
        },
      },
    },
    Channel: {
      Channels: {
        databases: {
          channel_db: ["channel_interactions", "session_data", "user_journeys"],
          interaction_db: ["channel_preferences", "usage_patterns", "feature_usage"],
        },
      },
      Operations: {
        databases: {
          channel_ops_db: ["channel_performance", "uptime_monitoring", "error_tracking"],
          performance_db: ["operational_metrics", "efficiency_reports", "sla_monitoring"],
        },
      },
      "Customer Communication": {
        databases: {
          channel_comm_db: ["channel_messages", "cross_channel_tracking", "message_routing"],
          message_db: ["communication_logs", "response_tracking", "escalation_management"],
        },
      },
    },
    Others: {
      Reference: {
        databases: {
          reference_db: ["reference_data", "code_tables", "configuration_settings"],
          lookup_db: ["lookup_tables", "master_data", "data_dictionary"],
        },
      },
      Compliance: {
        databases: {
          general_compliance_db: ["compliance_records", "policy_management", "training_records"],
          audit_db: ["audit_trails", "regulatory_reports", "examination_findings"],
        },
      },
      Operations: {
        databases: {
          operations_db: ["operational_data", "batch_processing", "system_monitoring"],
          workflow_db: ["workflow_instances", "process_metrics", "automation_rules"],
        },
      },
      Disputes: {
        databases: {
          disputes_db: ["dispute_cases", "dispute_categories", "investigation_notes"],
          resolution_db: ["resolution_actions", "dispute_outcomes", "chargeback_management"],
        },
      },
      Complaints: {
        databases: {
          complaints_db: ["customer_complaints", "complaint_categories", "escalation_tracking"],
          feedback_db: ["complaint_resolutions", "feedback_analysis", "satisfaction_surveys"],
        },
      },
      Merchant: {
        databases: {
          merchant_db: ["merchant_accounts", "merchant_onboarding", "merchant_profiles"],
          transaction_processing_db: ["merchant_transactions", "settlement_data", "fee_calculations"],
        },
      },
      "Account Promotions": {
        databases: {
          promotions_db: ["promotional_offers", "offer_management", "eligibility_rules"],
          offers_db: ["account_promotions", "promotion_results", "performance_tracking"],
        },
      },
    },
  };

  return (
    <div
      className={` min-h-screen min-w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans overflow-hidden flex flex-col`}
    >
      {/* {create == "Entity" && (
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
      )} */}
      <nav className="w-full h-20 bg-white/90 backdrop-blur-lg shadow-lg flex items-center justify-between px-10 rounded-b-3xl border-b border-indigo-100 z-10">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="text-white" size={28} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent tracking-wide drop-shadow">
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
          <button className="px-6 py-2 text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2 font-semibold">
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
          <div className="flex-1 p-3 overflow-y-auto min-h-0">
            <SidebarComponent
              activeTab={activeTab}
              selectedPath={selectedPath}
              create={create}
              setCreate={setCreate}
              businessData={businessData}
            />
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1  flex flex-col items-center p-0 min-h-0">
          {/* SearchBar above ER diagram, same width as ER diagram */}
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