App.jsx
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

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
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

  // businessData for SearchBar and FilterBar
  const businessData = {
    "Branded Cards": {
      Accounts: {
        databases: ["card_accounts_db", "card_profile_db"],
        tables: ["card_accounts", "card_holders", "card_limits"],
      },
      Payments: {
        databases: ["card_payments_db", "transaction_db"],
        tables: ["card_transactions", "payments", "authorizations"],
      },
      Fraud: {
        databases: ["fraud_detection_db", "security_db"],
        tables: ["fraud_alerts", "suspicious_transactions", "blocked_cards"],
      },
      Collections: {
        databases: ["collections_db", "delinquency_db"],
        tables: ["collection_cases", "payment_plans", "recovery_actions"],
      },
    },
    CRS: {
      Customer: {
        databases: ["crs_customer_db", "profile_db"],
        tables: ["customer_profiles", "contact_info", "preferences"],
      },
      Compliance: {
        databases: ["crs_compliance_db", "regulatory_db"],
        tables: ["compliance_reports", "tax_reporting", "regulatory_filings"],
      },
      Risk: {
        databases: ["crs_risk_db", "assessment_db"],
        tables: ["risk_assessments", "credit_scores", "risk_factors"],
      },
    },
    Deposits: {
      Accounts: {
        databases: ["deposit_accounts_db", "savings_db"],
        tables: ["savings_accounts", "checking_accounts", "account_balances"],
      },
      "Money Movement": {
        databases: ["transfer_db", "wire_db"],
        tables: ["transfers", "wire_transfers", "ach_transactions"],
      },
      Rate: {
        databases: ["interest_rates_db", "pricing_db"],
        tables: ["interest_rates", "rate_tiers", "promotional_rates"],
      },
      Fees: {
        databases: ["fee_structure_db", "charges_db"],
        tables: ["fee_schedule", "account_fees", "fee_waivers"],
      },
    },
    Investments: {
      Accounts: {
        databases: ["investment_accounts_db", "portfolio_db"],
        tables: ["investment_accounts", "portfolios", "holdings"],
      },
      Risk: {
        databases: ["investment_risk_db", "market_risk_db"],
        tables: ["risk_profiles", "market_risks", "portfolio_risks"],
      },
      Finance: {
        databases: ["investment_finance_db", "valuation_db"],
        tables: ["portfolio_valuations", "performance_metrics", "returns"],
      },
    },
    "Personal Loan": {
      Accounts: {
        databases: ["loan_accounts_db", "borrower_db"],
        tables: ["loan_accounts", "borrower_profiles", "loan_terms"],
      },
      Risk: {
        databases: ["loan_risk_db", "credit_db"],
        tables: ["credit_assessments", "default_risks", "loan_grades"],
      },
      Collections: {
        databases: ["loan_collections_db", "recovery_db"],
        tables: ["delinquent_loans", "collection_efforts", "recovery_plans"],
      },
      Servicing: {
        databases: ["loan_servicing_db", "payment_db"],
        tables: ["loan_payments", "payment_schedules", "servicing_records"],
      },
    },
    Mortgage: {
      Accounts: {
        databases: ["mortgage_accounts_db", "property_db"],
        tables: ["mortgage_accounts", "property_details", "loan_documents"],
      },
      Collateral: {
        databases: ["collateral_db", "appraisal_db"],
        tables: ["property_collateral", "appraisals", "collateral_valuations"],
      },
      Servicing: {
        databases: ["mortgage_servicing_db", "escrow_db"],
        tables: ["mortgage_payments", "escrow_accounts", "servicing_transfers"],
      },
      Risk: {
        databases: ["mortgage_risk_db", "ltv_db"],
        tables: ["loan_to_value", "mortgage_risks", "default_probabilities"],
      },
    },
    Customer: {
      Customer: {
        databases: ["customer_master_db", "demographics_db"],
        tables: ["customer_master", "demographics", "customer_segments"],
      },
      "Customer Communication": {
        databases: ["communication_db", "notification_db"],
        tables: ["communications", "notifications", "preferences"],
      },
      Acquisitions: {
        databases: ["acquisition_db", "prospect_db"],
        tables: ["prospects", "acquisition_campaigns", "conversion_metrics"],
      },
      Marketing: {
        databases: ["marketing_db", "campaign_db"],
        tables: ["campaigns", "customer_responses", "marketing_metrics"],
      },
    },
    Channel: {
      Channels: {
        databases: ["channel_db", "interaction_db"],
        tables: [
          "channel_interactions",
          "channel_preferences",
          "usage_patterns",
        ],
      },
      Operations: {
        databases: ["channel_ops_db", "performance_db"],
        tables: [
          "channel_performance",
          "operational_metrics",
          "efficiency_reports",
        ],
      },
      "Customer Communication": {
        databases: ["channel_comm_db", "message_db"],
        tables: ["channel_messages", "communication_logs", "response_tracking"],
      },
    },
    Others: {
      Reference: {
        databases: ["reference_db", "lookup_db"],
        tables: ["reference_data", "lookup_tables", "master_data"],
      },
      Compliance: {
        databases: ["general_compliance_db", "audit_db"],
        tables: ["compliance_records", "audit_trails", "regulatory_reports"],
      },
      Operations: {
        databases: ["operations_db", "workflow_db"],
        tables: ["operational_data", "workflow_instances", "process_metrics"],
      },
      Disputes: {
        databases: ["disputes_db", "resolution_db"],
        tables: ["dispute_cases", "resolution_actions", "dispute_outcomes"],
      },
      Complaints: {
        databases: ["complaints_db", "feedback_db"],
        tables: [
          "customer_complaints",
          "complaint_resolutions",
          "feedback_analysis",
        ],
      },
      Merchant: {
        databases: ["merchant_db", "transaction_processing_db"],
        tables: [
          "merchant_accounts",
          "merchant_transactions",
          "settlement_data",
        ],
      },
      "Account Promotions": {
        databases: ["promotions_db", "offers_db"],
        tables: [
          "promotional_offers",
          "account_promotions",
          "promotion_results",
        ],
      },
    },
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans overflow-auto">
      <nav className="w-full h-16 bg-white/80 backdrop-blur-md shadow-lg mb-2 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Database className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              DATABEE
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <User size={16} />
            Logout
          </button>
          <button className="px-6 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2">
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </nav>
      <div className="mt-5 my-3 ">
        <FilterBar
          selectedPath={selectedPath}
          onSelect={handleSelection}
        />
      </div>
      <div className="w-full h-[80vh] flex">
        {/* Sidebar */}
        <div className="w-72 h-full bg-white/90 backdrop-blur-sm shadow-xl mr-2 ml-1 rounded-3xl flex flex-col">
          <div className="border-b border-gray-200 p-4 b">
            <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-1">
              {sidebarItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      activeTab === item.id
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="space-y-1">
              {sidebarItems.slice(3).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
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
          <div className="flex-1 p-4 overflow-y-auto">
            <SidebarComponent
              activeTab={activeTab}
              selectedPath={selectedPath}
            />
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center p-0 min-h-0">
          {/* SearchBar above ER diagram, same width as ER diagram */}
          <div className="w-full max-w-[1600px] mb-2 shrink-0">
            <SearchBar
              businessData={businessData}
              onSelect={handleSelection}
            />
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
