--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: card_disputes; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA card_disputes;


ALTER SCHEMA card_disputes OWNER TO postgres;

--
-- Name: card_fraud_detection; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA card_fraud_detection;


ALTER SCHEMA card_fraud_detection OWNER TO postgres;

--
-- Name: card_payments; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA card_payments;


ALTER SCHEMA card_payments OWNER TO postgres;

--
-- Name: channel_management; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA channel_management;


ALTER SCHEMA channel_management OWNER TO postgres;

--
-- Name: channel_operations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA channel_operations;


ALTER SCHEMA channel_operations OWNER TO postgres;

--
-- Name: credit_card_accounts; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA credit_card_accounts;


ALTER SCHEMA credit_card_accounts OWNER TO postgres;

--
-- Name: credit_card_promotions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA credit_card_promotions;


ALTER SCHEMA credit_card_promotions OWNER TO postgres;

--
-- Name: credit_risk_mgmt; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA credit_risk_mgmt;


ALTER SCHEMA credit_risk_mgmt OWNER TO postgres;

--
-- Name: customer_communications; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA customer_communications;


ALTER SCHEMA customer_communications OWNER TO postgres;

--
-- Name: customer_complaints; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA customer_complaints;


ALTER SCHEMA customer_complaints OWNER TO postgres;

--
-- Name: customer_marketing; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA customer_marketing;


ALTER SCHEMA customer_marketing OWNER TO postgres;

--
-- Name: customer_master; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA customer_master;


ALTER SCHEMA customer_master OWNER TO postgres;

--
-- Name: customer_profile; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA customer_profile;


ALTER SCHEMA customer_profile OWNER TO postgres;

--
-- Name: deposit_accounts; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA deposit_accounts;


ALTER SCHEMA deposit_accounts OWNER TO postgres;

--
-- Name: deposit_fees; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA deposit_fees;


ALTER SCHEMA deposit_fees OWNER TO postgres;

--
-- Name: deposit_transactions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA deposit_transactions;


ALTER SCHEMA deposit_transactions OWNER TO postgres;

--
-- Name: general_finance; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA general_finance;


ALTER SCHEMA general_finance OWNER TO postgres;

--
-- Name: general_operations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA general_operations;


ALTER SCHEMA general_operations OWNER TO postgres;

--
-- Name: interest_rates; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA interest_rates;


ALTER SCHEMA interest_rates OWNER TO postgres;

--
-- Name: investment_accounts; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA investment_accounts;


ALTER SCHEMA investment_accounts OWNER TO postgres;

--
-- Name: investment_collateral; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA investment_collateral;


ALTER SCHEMA investment_collateral OWNER TO postgres;

--
-- Name: investment_finance; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA investment_finance;


ALTER SCHEMA investment_finance OWNER TO postgres;

--
-- Name: investment_risk; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA investment_risk;


ALTER SCHEMA investment_risk OWNER TO postgres;

--
-- Name: loan_collections; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA loan_collections;


ALTER SCHEMA loan_collections OWNER TO postgres;

--
-- Name: loan_origination; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA loan_origination;


ALTER SCHEMA loan_origination OWNER TO postgres;

--
-- Name: loan_risk_assessment; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA loan_risk_assessment;


ALTER SCHEMA loan_risk_assessment OWNER TO postgres;

--
-- Name: loan_servicing; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA loan_servicing;


ALTER SCHEMA loan_servicing OWNER TO postgres;

--
-- Name: master_reference; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA master_reference;


ALTER SCHEMA master_reference OWNER TO postgres;

--
-- Name: merchant_services; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA merchant_services;


ALTER SCHEMA merchant_services OWNER TO postgres;

--
-- Name: mortgage_collateral; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA mortgage_collateral;


ALTER SCHEMA mortgage_collateral OWNER TO postgres;

--
-- Name: mortgage_collections; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA mortgage_collections;


ALTER SCHEMA mortgage_collections OWNER TO postgres;

--
-- Name: mortgage_origination; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA mortgage_origination;


ALTER SCHEMA mortgage_origination OWNER TO postgres;

--
-- Name: mortgage_risk; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA mortgage_risk;


ALTER SCHEMA mortgage_risk OWNER TO postgres;

--
-- Name: mortgage_servicing; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA mortgage_servicing;


ALTER SCHEMA mortgage_servicing OWNER TO postgres;

--
-- Name: reference_data; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA reference_data;


ALTER SCHEMA reference_data OWNER TO postgres;

--
-- Name: regulatory_compliance; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA regulatory_compliance;


ALTER SCHEMA regulatory_compliance OWNER TO postgres;

--
-- Name: test; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA test;


ALTER SCHEMA test OWNER TO postgres;

--
-- Name: test_mortgage; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA test_mortgage;


ALTER SCHEMA test_mortgage OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: table; Type: TABLE; Schema: card_disputes; Owner: postgres
--

CREATE TABLE card_disputes."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE card_disputes."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: card_disputes; Owner: postgres
--

CREATE SEQUENCE card_disputes.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE card_disputes.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: card_disputes; Owner: postgres
--

ALTER SEQUENCE card_disputes.table_id_seq OWNED BY card_disputes."table".id;


--
-- Name: table; Type: TABLE; Schema: card_fraud_detection; Owner: postgres
--

CREATE TABLE card_fraud_detection."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE card_fraud_detection."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: card_fraud_detection; Owner: postgres
--

CREATE SEQUENCE card_fraud_detection.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE card_fraud_detection.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: card_fraud_detection; Owner: postgres
--

ALTER SEQUENCE card_fraud_detection.table_id_seq OWNED BY card_fraud_detection."table".id;


--
-- Name: table; Type: TABLE; Schema: card_payments; Owner: postgres
--

CREATE TABLE card_payments."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE card_payments."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: card_payments; Owner: postgres
--

CREATE SEQUENCE card_payments.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE card_payments.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: card_payments; Owner: postgres
--

ALTER SEQUENCE card_payments.table_id_seq OWNED BY card_payments."table".id;


--
-- Name: table; Type: TABLE; Schema: channel_management; Owner: postgres
--

CREATE TABLE channel_management."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE channel_management."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: channel_management; Owner: postgres
--

CREATE SEQUENCE channel_management.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE channel_management.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: channel_management; Owner: postgres
--

ALTER SEQUENCE channel_management.table_id_seq OWNED BY channel_management."table".id;


--
-- Name: table; Type: TABLE; Schema: channel_operations; Owner: postgres
--

CREATE TABLE channel_operations."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE channel_operations."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: channel_operations; Owner: postgres
--

CREATE SEQUENCE channel_operations.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE channel_operations.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: channel_operations; Owner: postgres
--

ALTER SEQUENCE channel_operations.table_id_seq OWNED BY channel_operations."table".id;


--
-- Name: table; Type: TABLE; Schema: credit_card_accounts; Owner: postgres
--

CREATE TABLE credit_card_accounts."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE credit_card_accounts."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: credit_card_accounts; Owner: postgres
--

CREATE SEQUENCE credit_card_accounts.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE credit_card_accounts.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: credit_card_accounts; Owner: postgres
--

ALTER SEQUENCE credit_card_accounts.table_id_seq OWNED BY credit_card_accounts."table".id;


--
-- Name: table; Type: TABLE; Schema: credit_card_promotions; Owner: postgres
--

CREATE TABLE credit_card_promotions."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE credit_card_promotions."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: credit_card_promotions; Owner: postgres
--

CREATE SEQUENCE credit_card_promotions.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE credit_card_promotions.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: credit_card_promotions; Owner: postgres
--

ALTER SEQUENCE credit_card_promotions.table_id_seq OWNED BY credit_card_promotions."table".id;


--
-- Name: table; Type: TABLE; Schema: credit_risk_mgmt; Owner: postgres
--

CREATE TABLE credit_risk_mgmt."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE credit_risk_mgmt."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: credit_risk_mgmt; Owner: postgres
--

CREATE SEQUENCE credit_risk_mgmt.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE credit_risk_mgmt.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: credit_risk_mgmt; Owner: postgres
--

ALTER SEQUENCE credit_risk_mgmt.table_id_seq OWNED BY credit_risk_mgmt."table".id;


--
-- Name: table; Type: TABLE; Schema: customer_communications; Owner: postgres
--

CREATE TABLE customer_communications."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE customer_communications."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: customer_communications; Owner: postgres
--

CREATE SEQUENCE customer_communications.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE customer_communications.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: customer_communications; Owner: postgres
--

ALTER SEQUENCE customer_communications.table_id_seq OWNED BY customer_communications."table".id;


--
-- Name: table; Type: TABLE; Schema: customer_complaints; Owner: postgres
--

CREATE TABLE customer_complaints."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE customer_complaints."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: customer_complaints; Owner: postgres
--

CREATE SEQUENCE customer_complaints.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE customer_complaints.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: customer_complaints; Owner: postgres
--

ALTER SEQUENCE customer_complaints.table_id_seq OWNED BY customer_complaints."table".id;


--
-- Name: table; Type: TABLE; Schema: customer_marketing; Owner: postgres
--

CREATE TABLE customer_marketing."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE customer_marketing."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: customer_marketing; Owner: postgres
--

CREATE SEQUENCE customer_marketing.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE customer_marketing.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: customer_marketing; Owner: postgres
--

ALTER SEQUENCE customer_marketing.table_id_seq OWNED BY customer_marketing."table".id;


--
-- Name: table; Type: TABLE; Schema: customer_master; Owner: postgres
--

CREATE TABLE customer_master."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE customer_master."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: customer_master; Owner: postgres
--

CREATE SEQUENCE customer_master.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE customer_master.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: customer_master; Owner: postgres
--

ALTER SEQUENCE customer_master.table_id_seq OWNED BY customer_master."table".id;


--
-- Name: table; Type: TABLE; Schema: customer_profile; Owner: postgres
--

CREATE TABLE customer_profile."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE customer_profile."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: customer_profile; Owner: postgres
--

CREATE SEQUENCE customer_profile.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE customer_profile.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: customer_profile; Owner: postgres
--

ALTER SEQUENCE customer_profile.table_id_seq OWNED BY customer_profile."table".id;


--
-- Name: table; Type: TABLE; Schema: deposit_accounts; Owner: postgres
--

CREATE TABLE deposit_accounts."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE deposit_accounts."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: deposit_accounts; Owner: postgres
--

CREATE SEQUENCE deposit_accounts.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE deposit_accounts.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: deposit_accounts; Owner: postgres
--

ALTER SEQUENCE deposit_accounts.table_id_seq OWNED BY deposit_accounts."table".id;


--
-- Name: table; Type: TABLE; Schema: deposit_fees; Owner: postgres
--

CREATE TABLE deposit_fees."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE deposit_fees."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: deposit_fees; Owner: postgres
--

CREATE SEQUENCE deposit_fees.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE deposit_fees.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: deposit_fees; Owner: postgres
--

ALTER SEQUENCE deposit_fees.table_id_seq OWNED BY deposit_fees."table".id;


--
-- Name: table; Type: TABLE; Schema: deposit_transactions; Owner: postgres
--

CREATE TABLE deposit_transactions."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE deposit_transactions."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: deposit_transactions; Owner: postgres
--

CREATE SEQUENCE deposit_transactions.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE deposit_transactions.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: deposit_transactions; Owner: postgres
--

ALTER SEQUENCE deposit_transactions.table_id_seq OWNED BY deposit_transactions."table".id;


--
-- Name: table; Type: TABLE; Schema: general_finance; Owner: postgres
--

CREATE TABLE general_finance."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE general_finance."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: general_finance; Owner: postgres
--

CREATE SEQUENCE general_finance.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE general_finance.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: general_finance; Owner: postgres
--

ALTER SEQUENCE general_finance.table_id_seq OWNED BY general_finance."table".id;


--
-- Name: table; Type: TABLE; Schema: general_operations; Owner: postgres
--

CREATE TABLE general_operations."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE general_operations."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: general_operations; Owner: postgres
--

CREATE SEQUENCE general_operations.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE general_operations.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: general_operations; Owner: postgres
--

ALTER SEQUENCE general_operations.table_id_seq OWNED BY general_operations."table".id;


--
-- Name: table; Type: TABLE; Schema: interest_rates; Owner: postgres
--

CREATE TABLE interest_rates."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE interest_rates."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: interest_rates; Owner: postgres
--

CREATE SEQUENCE interest_rates.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE interest_rates.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: interest_rates; Owner: postgres
--

ALTER SEQUENCE interest_rates.table_id_seq OWNED BY interest_rates."table".id;


--
-- Name: table; Type: TABLE; Schema: investment_accounts; Owner: postgres
--

CREATE TABLE investment_accounts."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE investment_accounts."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: investment_accounts; Owner: postgres
--

CREATE SEQUENCE investment_accounts.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE investment_accounts.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: investment_accounts; Owner: postgres
--

ALTER SEQUENCE investment_accounts.table_id_seq OWNED BY investment_accounts."table".id;


--
-- Name: table; Type: TABLE; Schema: investment_collateral; Owner: postgres
--

CREATE TABLE investment_collateral."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE investment_collateral."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: investment_collateral; Owner: postgres
--

CREATE SEQUENCE investment_collateral.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE investment_collateral.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: investment_collateral; Owner: postgres
--

ALTER SEQUENCE investment_collateral.table_id_seq OWNED BY investment_collateral."table".id;


--
-- Name: table; Type: TABLE; Schema: investment_finance; Owner: postgres
--

CREATE TABLE investment_finance."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE investment_finance."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: investment_finance; Owner: postgres
--

CREATE SEQUENCE investment_finance.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE investment_finance.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: investment_finance; Owner: postgres
--

ALTER SEQUENCE investment_finance.table_id_seq OWNED BY investment_finance."table".id;


--
-- Name: table; Type: TABLE; Schema: investment_risk; Owner: postgres
--

CREATE TABLE investment_risk."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE investment_risk."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: investment_risk; Owner: postgres
--

CREATE SEQUENCE investment_risk.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE investment_risk.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: investment_risk; Owner: postgres
--

ALTER SEQUENCE investment_risk.table_id_seq OWNED BY investment_risk."table".id;


--
-- Name: table; Type: TABLE; Schema: loan_collections; Owner: postgres
--

CREATE TABLE loan_collections."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE loan_collections."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: loan_collections; Owner: postgres
--

CREATE SEQUENCE loan_collections.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE loan_collections.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: loan_collections; Owner: postgres
--

ALTER SEQUENCE loan_collections.table_id_seq OWNED BY loan_collections."table".id;


--
-- Name: table; Type: TABLE; Schema: loan_origination; Owner: postgres
--

CREATE TABLE loan_origination."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE loan_origination."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: loan_origination; Owner: postgres
--

CREATE SEQUENCE loan_origination.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE loan_origination.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: loan_origination; Owner: postgres
--

ALTER SEQUENCE loan_origination.table_id_seq OWNED BY loan_origination."table".id;


--
-- Name: table; Type: TABLE; Schema: loan_risk_assessment; Owner: postgres
--

CREATE TABLE loan_risk_assessment."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE loan_risk_assessment."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: loan_risk_assessment; Owner: postgres
--

CREATE SEQUENCE loan_risk_assessment.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE loan_risk_assessment.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: loan_risk_assessment; Owner: postgres
--

ALTER SEQUENCE loan_risk_assessment.table_id_seq OWNED BY loan_risk_assessment."table".id;


--
-- Name: table; Type: TABLE; Schema: loan_servicing; Owner: postgres
--

CREATE TABLE loan_servicing."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE loan_servicing."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: loan_servicing; Owner: postgres
--

CREATE SEQUENCE loan_servicing.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE loan_servicing.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: loan_servicing; Owner: postgres
--

ALTER SEQUENCE loan_servicing.table_id_seq OWNED BY loan_servicing."table".id;


--
-- Name: table; Type: TABLE; Schema: master_reference; Owner: postgres
--

CREATE TABLE master_reference."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE master_reference."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: master_reference; Owner: postgres
--

CREATE SEQUENCE master_reference.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE master_reference.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: master_reference; Owner: postgres
--

ALTER SEQUENCE master_reference.table_id_seq OWNED BY master_reference."table".id;


--
-- Name: table; Type: TABLE; Schema: merchant_services; Owner: postgres
--

CREATE TABLE merchant_services."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE merchant_services."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: merchant_services; Owner: postgres
--

CREATE SEQUENCE merchant_services.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE merchant_services.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: merchant_services; Owner: postgres
--

ALTER SEQUENCE merchant_services.table_id_seq OWNED BY merchant_services."table".id;


--
-- Name: table; Type: TABLE; Schema: mortgage_collateral; Owner: postgres
--

CREATE TABLE mortgage_collateral."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE mortgage_collateral."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: mortgage_collateral; Owner: postgres
--

CREATE SEQUENCE mortgage_collateral.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE mortgage_collateral.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: mortgage_collateral; Owner: postgres
--

ALTER SEQUENCE mortgage_collateral.table_id_seq OWNED BY mortgage_collateral."table".id;


--
-- Name: table; Type: TABLE; Schema: mortgage_collections; Owner: postgres
--

CREATE TABLE mortgage_collections."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE mortgage_collections."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: mortgage_collections; Owner: postgres
--

CREATE SEQUENCE mortgage_collections.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE mortgage_collections.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: mortgage_collections; Owner: postgres
--

ALTER SEQUENCE mortgage_collections.table_id_seq OWNED BY mortgage_collections."table".id;


--
-- Name: table; Type: TABLE; Schema: mortgage_origination; Owner: postgres
--

CREATE TABLE mortgage_origination."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE mortgage_origination."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: mortgage_origination; Owner: postgres
--

CREATE SEQUENCE mortgage_origination.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE mortgage_origination.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: mortgage_origination; Owner: postgres
--

ALTER SEQUENCE mortgage_origination.table_id_seq OWNED BY mortgage_origination."table".id;


--
-- Name: table; Type: TABLE; Schema: mortgage_risk; Owner: postgres
--

CREATE TABLE mortgage_risk."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE mortgage_risk."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: mortgage_risk; Owner: postgres
--

CREATE SEQUENCE mortgage_risk.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE mortgage_risk.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: mortgage_risk; Owner: postgres
--

ALTER SEQUENCE mortgage_risk.table_id_seq OWNED BY mortgage_risk."table".id;


--
-- Name: table; Type: TABLE; Schema: mortgage_servicing; Owner: postgres
--

CREATE TABLE mortgage_servicing."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE mortgage_servicing."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: mortgage_servicing; Owner: postgres
--

CREATE SEQUENCE mortgage_servicing.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE mortgage_servicing.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: mortgage_servicing; Owner: postgres
--

ALTER SEQUENCE mortgage_servicing.table_id_seq OWNED BY mortgage_servicing."table".id;


--
-- Name: er_relationships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.er_relationships (
    id integer NOT NULL,
    database_name text NOT NULL,
    from_table_id integer NOT NULL,
    from_column text NOT NULL,
    to_table_id integer NOT NULL,
    to_column text NOT NULL,
    cardinality text NOT NULL,
    relationship_type text DEFAULT 'foreign_key'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT er_relationships_cardinality_check CHECK ((cardinality = ANY (ARRAY['one-to-one'::text, 'one-to-many'::text, 'many-to-one'::text])))
);


ALTER TABLE public.er_relationships OWNER TO postgres;

--
-- Name: TABLE er_relationships; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.er_relationships IS 'Entity-relationship mappings between tables';


--
-- Name: COLUMN er_relationships.database_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.database_name IS 'Name of the database containing the relationship';


--
-- Name: COLUMN er_relationships.from_table_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.from_table_id IS 'Source table of the relationship';


--
-- Name: COLUMN er_relationships.from_column; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.from_column IS 'Source column name';


--
-- Name: COLUMN er_relationships.to_table_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.to_table_id IS 'Target table of the relationship';


--
-- Name: COLUMN er_relationships.to_column; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.to_column IS 'Target column name';


--
-- Name: COLUMN er_relationships.cardinality; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.cardinality IS 'Relationship cardinality';


--
-- Name: COLUMN er_relationships.relationship_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.relationship_type IS 'Type of relationship (foreign_key, etc.)';


--
-- Name: COLUMN er_relationships.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.er_relationships.created_at IS 'Timestamp when relationship was created';


--
-- Name: er_relationships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.er_relationships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.er_relationships_id_seq OWNER TO postgres;

--
-- Name: er_relationships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.er_relationships_id_seq OWNED BY public.er_relationships.id;


--
-- Name: lobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lobs (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.lobs OWNER TO postgres;

--
-- Name: lobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lobs_id_seq OWNER TO postgres;

--
-- Name: lobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lobs_id_seq OWNED BY public.lobs.id;


--
-- Name: logical_databases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logical_databases (
    id integer NOT NULL,
    name text NOT NULL,
    subject_area_id integer
);


ALTER TABLE public.logical_databases OWNER TO postgres;

--
-- Name: logical_databases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logical_databases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logical_databases_id_seq OWNER TO postgres;

--
-- Name: logical_databases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logical_databases_id_seq OWNED BY public.logical_databases.id;


--
-- Name: subject_areas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject_areas (
    id integer NOT NULL,
    name text NOT NULL,
    lob_id integer
);


ALTER TABLE public.subject_areas OWNER TO postgres;

--
-- Name: subject_areas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subject_areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subject_areas_id_seq OWNER TO postgres;

--
-- Name: subject_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subject_areas_id_seq OWNED BY public.subject_areas.id;


--
-- Name: tables_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tables_metadata (
    id integer NOT NULL,
    name text NOT NULL,
    schema_name text DEFAULT 'public'::text,
    database_id integer
);


ALTER TABLE public.tables_metadata OWNER TO postgres;

--
-- Name: tables_metadata_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tables_metadata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tables_metadata_id_seq OWNER TO postgres;

--
-- Name: tables_metadata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tables_metadata_id_seq OWNED BY public.tables_metadata.id;


--
-- Name: table; Type: TABLE; Schema: reference_data; Owner: postgres
--

CREATE TABLE reference_data."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE reference_data."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: reference_data; Owner: postgres
--

CREATE SEQUENCE reference_data.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE reference_data.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: reference_data; Owner: postgres
--

ALTER SEQUENCE reference_data.table_id_seq OWNED BY reference_data."table".id;


--
-- Name: table; Type: TABLE; Schema: regulatory_compliance; Owner: postgres
--

CREATE TABLE regulatory_compliance."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE regulatory_compliance."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: regulatory_compliance; Owner: postgres
--

CREATE SEQUENCE regulatory_compliance.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE regulatory_compliance.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: regulatory_compliance; Owner: postgres
--

ALTER SEQUENCE regulatory_compliance.table_id_seq OWNED BY regulatory_compliance."table".id;


--
-- Name: table; Type: TABLE; Schema: test; Owner: postgres
--

CREATE TABLE test."table" (
    id integer NOT NULL,
    table_id integer,
    table_name text,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE test."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: test; Owner: postgres
--

CREATE SEQUENCE test.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE test.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: test; Owner: postgres
--

ALTER SEQUENCE test.table_id_seq OWNED BY test."table".id;


--
-- Name: table; Type: TABLE; Schema: test_mortgage; Owner: postgres
--

CREATE TABLE test_mortgage."table" (
    id integer NOT NULL,
    input_format text,
    output_format text,
    location text,
    partitioned_by text
);


ALTER TABLE test_mortgage."table" OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE; Schema: test_mortgage; Owner: postgres
--

CREATE SEQUENCE test_mortgage.table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE test_mortgage.table_id_seq OWNER TO postgres;

--
-- Name: table_id_seq; Type: SEQUENCE OWNED BY; Schema: test_mortgage; Owner: postgres
--

ALTER SEQUENCE test_mortgage.table_id_seq OWNED BY test_mortgage."table".id;


--
-- Name: table id; Type: DEFAULT; Schema: card_disputes; Owner: postgres
--

ALTER TABLE ONLY card_disputes."table" ALTER COLUMN id SET DEFAULT nextval('card_disputes.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: card_fraud_detection; Owner: postgres
--

ALTER TABLE ONLY card_fraud_detection."table" ALTER COLUMN id SET DEFAULT nextval('card_fraud_detection.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: card_payments; Owner: postgres
--

ALTER TABLE ONLY card_payments."table" ALTER COLUMN id SET DEFAULT nextval('card_payments.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: channel_management; Owner: postgres
--

ALTER TABLE ONLY channel_management."table" ALTER COLUMN id SET DEFAULT nextval('channel_management.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: channel_operations; Owner: postgres
--

ALTER TABLE ONLY channel_operations."table" ALTER COLUMN id SET DEFAULT nextval('channel_operations.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: credit_card_accounts; Owner: postgres
--

ALTER TABLE ONLY credit_card_accounts."table" ALTER COLUMN id SET DEFAULT nextval('credit_card_accounts.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: credit_card_promotions; Owner: postgres
--

ALTER TABLE ONLY credit_card_promotions."table" ALTER COLUMN id SET DEFAULT nextval('credit_card_promotions.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: credit_risk_mgmt; Owner: postgres
--

ALTER TABLE ONLY credit_risk_mgmt."table" ALTER COLUMN id SET DEFAULT nextval('credit_risk_mgmt.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: customer_communications; Owner: postgres
--

ALTER TABLE ONLY customer_communications."table" ALTER COLUMN id SET DEFAULT nextval('customer_communications.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: customer_complaints; Owner: postgres
--

ALTER TABLE ONLY customer_complaints."table" ALTER COLUMN id SET DEFAULT nextval('customer_complaints.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: customer_marketing; Owner: postgres
--

ALTER TABLE ONLY customer_marketing."table" ALTER COLUMN id SET DEFAULT nextval('customer_marketing.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: customer_master; Owner: postgres
--

ALTER TABLE ONLY customer_master."table" ALTER COLUMN id SET DEFAULT nextval('customer_master.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: customer_profile; Owner: postgres
--

ALTER TABLE ONLY customer_profile."table" ALTER COLUMN id SET DEFAULT nextval('customer_profile.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: deposit_accounts; Owner: postgres
--

ALTER TABLE ONLY deposit_accounts."table" ALTER COLUMN id SET DEFAULT nextval('deposit_accounts.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: deposit_fees; Owner: postgres
--

ALTER TABLE ONLY deposit_fees."table" ALTER COLUMN id SET DEFAULT nextval('deposit_fees.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: deposit_transactions; Owner: postgres
--

ALTER TABLE ONLY deposit_transactions."table" ALTER COLUMN id SET DEFAULT nextval('deposit_transactions.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: general_finance; Owner: postgres
--

ALTER TABLE ONLY general_finance."table" ALTER COLUMN id SET DEFAULT nextval('general_finance.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: general_operations; Owner: postgres
--

ALTER TABLE ONLY general_operations."table" ALTER COLUMN id SET DEFAULT nextval('general_operations.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: interest_rates; Owner: postgres
--

ALTER TABLE ONLY interest_rates."table" ALTER COLUMN id SET DEFAULT nextval('interest_rates.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: investment_accounts; Owner: postgres
--

ALTER TABLE ONLY investment_accounts."table" ALTER COLUMN id SET DEFAULT nextval('investment_accounts.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: investment_collateral; Owner: postgres
--

ALTER TABLE ONLY investment_collateral."table" ALTER COLUMN id SET DEFAULT nextval('investment_collateral.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: investment_finance; Owner: postgres
--

ALTER TABLE ONLY investment_finance."table" ALTER COLUMN id SET DEFAULT nextval('investment_finance.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: investment_risk; Owner: postgres
--

ALTER TABLE ONLY investment_risk."table" ALTER COLUMN id SET DEFAULT nextval('investment_risk.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: loan_collections; Owner: postgres
--

ALTER TABLE ONLY loan_collections."table" ALTER COLUMN id SET DEFAULT nextval('loan_collections.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: loan_origination; Owner: postgres
--

ALTER TABLE ONLY loan_origination."table" ALTER COLUMN id SET DEFAULT nextval('loan_origination.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: loan_risk_assessment; Owner: postgres
--

ALTER TABLE ONLY loan_risk_assessment."table" ALTER COLUMN id SET DEFAULT nextval('loan_risk_assessment.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: loan_servicing; Owner: postgres
--

ALTER TABLE ONLY loan_servicing."table" ALTER COLUMN id SET DEFAULT nextval('loan_servicing.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: master_reference; Owner: postgres
--

ALTER TABLE ONLY master_reference."table" ALTER COLUMN id SET DEFAULT nextval('master_reference.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: merchant_services; Owner: postgres
--

ALTER TABLE ONLY merchant_services."table" ALTER COLUMN id SET DEFAULT nextval('merchant_services.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: mortgage_collateral; Owner: postgres
--

ALTER TABLE ONLY mortgage_collateral."table" ALTER COLUMN id SET DEFAULT nextval('mortgage_collateral.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: mortgage_collections; Owner: postgres
--

ALTER TABLE ONLY mortgage_collections."table" ALTER COLUMN id SET DEFAULT nextval('mortgage_collections.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: mortgage_origination; Owner: postgres
--

ALTER TABLE ONLY mortgage_origination."table" ALTER COLUMN id SET DEFAULT nextval('mortgage_origination.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: mortgage_risk; Owner: postgres
--

ALTER TABLE ONLY mortgage_risk."table" ALTER COLUMN id SET DEFAULT nextval('mortgage_risk.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: mortgage_servicing; Owner: postgres
--

ALTER TABLE ONLY mortgage_servicing."table" ALTER COLUMN id SET DEFAULT nextval('mortgage_servicing.table_id_seq'::regclass);


--
-- Name: er_relationships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.er_relationships ALTER COLUMN id SET DEFAULT nextval('public.er_relationships_id_seq'::regclass);


--
-- Name: lobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lobs ALTER COLUMN id SET DEFAULT nextval('public.lobs_id_seq'::regclass);


--
-- Name: logical_databases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logical_databases ALTER COLUMN id SET DEFAULT nextval('public.logical_databases_id_seq'::regclass);


--
-- Name: subject_areas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_areas ALTER COLUMN id SET DEFAULT nextval('public.subject_areas_id_seq'::regclass);


--
-- Name: tables_metadata id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables_metadata ALTER COLUMN id SET DEFAULT nextval('public.tables_metadata_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data."table" ALTER COLUMN id SET DEFAULT nextval('reference_data.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: regulatory_compliance; Owner: postgres
--

ALTER TABLE ONLY regulatory_compliance."table" ALTER COLUMN id SET DEFAULT nextval('regulatory_compliance.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test."table" ALTER COLUMN id SET DEFAULT nextval('test.table_id_seq'::regclass);


--
-- Name: table id; Type: DEFAULT; Schema: test_mortgage; Owner: postgres
--

ALTER TABLE ONLY test_mortgage."table" ALTER COLUMN id SET DEFAULT nextval('test_mortgage.table_id_seq'::regclass);


--
-- Data for Name: table; Type: TABLE DATA; Schema: card_disputes; Owner: postgres
--

COPY card_disputes."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	14	dispute_cases	CSV	Parquet	/data/card_disputes/dispute_cases/	transaction_type
2	15	dispute_evidence	Parquet	CSV	/data/card_disputes/dispute_evidence/	region
3	16	chargeback_requests	JSON	JSON	/data/card_disputes/chargeback_requests/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: card_fraud_detection; Owner: postgres
--

COPY card_fraud_detection."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	11	fraud_alerts	JSON	JSON	/data/card_fraud_detection/fraud_alerts/	account_type
2	12	fraud_rules	Parquet	JSON	/data/card_fraud_detection/fraud_rules/	transaction_type
3	13	blocked_transactions	CSV	CSV	/data/card_fraud_detection/blocked_transactions/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: card_payments; Owner: postgres
--

COPY card_payments."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	8	payment_transactions	CSV	CSV	/data/card_payments/payment_transactions/	account_type
2	9	payment_methods	JSON	CSV	/data/card_payments/payment_methods/	transaction_type
3	10	merchant_transactions	CSV	Parquet	/data/card_payments/merchant_transactions/	account_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: channel_management; Owner: postgres
--

COPY channel_management."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	93	channels	CSV	JSON	/data/channel_management/channels/	date
2	94	channel_performance	JSON	JSON	/data/channel_management/channel_performance/	transaction_type
3	95	channel_costs	JSON	Parquet	/data/channel_management/channel_costs/	date
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: channel_operations; Owner: postgres
--

COPY channel_operations."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	96	atm_locations	JSON	Parquet	/data/channel_operations/atm_locations/	date
2	97	branch_locations	CSV	JSON	/data/channel_operations/branch_locations/	transaction_type
3	98	online_sessions	Parquet	CSV	/data/channel_operations/online_sessions/	transaction_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: credit_card_accounts; Owner: postgres
--

COPY credit_card_accounts."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	4	credit_accounts	Avro	JSON	/data/credit_card_accounts/credit_accounts/	region
2	5	account_balances	CSV	JSON	/data/credit_card_accounts/account_balances/	account_type
3	6	account_limits	Parquet	JSON	/data/credit_card_accounts/account_limits/	date
4	7	account_status	CSV	Parquet	/data/credit_card_accounts/account_status/	date
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: credit_card_promotions; Owner: postgres
--

COPY credit_card_promotions."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	1	promotions	Avro	JSON	/data/credit_card_promotions/promotions/	date
2	2	promotion_eligibility	Parquet	JSON	/data/credit_card_promotions/promotion_eligibility/	date
3	3	promotion_responses	Avro	Parquet	/data/credit_card_promotions/promotion_responses/	transaction_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: credit_risk_mgmt; Owner: postgres
--

COPY credit_risk_mgmt."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	24	risk_scores	Avro	CSV	/data/credit_risk_mgmt/risk_scores/	transaction_type
2	25	risk_models	JSON	CSV	/data/credit_risk_mgmt/risk_models/	transaction_type
3	26	risk_assessments	CSV	JSON	/data/credit_risk_mgmt/risk_assessments/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: customer_communications; Owner: postgres
--

COPY customer_communications."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	84	email_campaigns	Parquet	Parquet	/data/customer_communications/email_campaigns/	date
2	85	sms_notifications	CSV	JSON	/data/customer_communications/sms_notifications/	account_type
3	86	communication_logs	Avro	Parquet	/data/customer_communications/communication_logs/	account_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: customer_complaints; Owner: postgres
--

COPY customer_complaints."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	87	complaint_cases	CSV	CSV	/data/customer_complaints/complaint_cases/	date
2	88	complaint_resolutions	JSON	CSV	/data/customer_complaints/complaint_resolutions/	date
3	89	complaint_categories	Parquet	CSV	/data/customer_complaints/complaint_categories/	date
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: customer_marketing; Owner: postgres
--

COPY customer_marketing."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	90	marketing_campaigns	Avro	Parquet	/data/customer_marketing/marketing_campaigns/	transaction_type
2	91	customer_segments	Parquet	CSV	/data/customer_marketing/customer_segments/	region
3	92	campaign_responses	CSV	Parquet	/data/customer_marketing/campaign_responses/	account_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: customer_master; Owner: postgres
--

COPY customer_master."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	17	customers	Parquet	Parquet	/data/customer_master/customers/	region
2	18	customer_demographics	Avro	JSON	/data/customer_master/customer_demographics/	transaction_type
3	19	customer_addresses	Parquet	JSON	/data/customer_master/customer_addresses/	region
4	20	customer_contacts	Parquet	Parquet	/data/customer_master/customer_contacts/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: customer_profile; Owner: postgres
--

COPY customer_profile."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	81	customer_profiles	JSON	CSV	/data/customer_profile/customer_profiles/	date
2	82	customer_preferences	Parquet	JSON	/data/customer_profile/customer_preferences/	region
3	83	customer_relationships	JSON	JSON	/data/customer_profile/customer_relationships/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: deposit_accounts; Owner: postgres
--

COPY deposit_accounts."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	30	deposit_accounts	JSON	Parquet	/data/deposit_accounts/deposit_accounts/	region
2	31	savings_accounts	CSV	Parquet	/data/deposit_accounts/savings_accounts/	date
3	32	checking_accounts	Parquet	JSON	/data/deposit_accounts/checking_accounts/	account_type
4	114	tet	Avro	JSON	/data/deposit_accounts/tet/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: deposit_fees; Owner: postgres
--

COPY deposit_fees."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	39	fee_schedules	JSON	CSV	/data/deposit_fees/fee_schedules/	date
2	40	fee_transactions	CSV	CSV	/data/deposit_fees/fee_transactions/	account_type
3	41	fee_waivers	Parquet	CSV	/data/deposit_fees/fee_waivers/	date
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: deposit_transactions; Owner: postgres
--

COPY deposit_transactions."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	33	deposit_transactions	JSON	JSON	/data/deposit_transactions/deposit_transactions/	account_type
2	34	withdrawal_transactions	CSV	CSV	/data/deposit_transactions/withdrawal_transactions/	date
3	35	transfer_transactions	Parquet	CSV	/data/deposit_transactions/transfer_transactions/	date
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: general_finance; Owner: postgres
--

COPY general_finance."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	102	general_ledger	JSON	JSON	/data/general_finance/general_ledger/	region
2	103	financial_statements	CSV	JSON	/data/general_finance/financial_statements/	date
3	104	budget_allocations	JSON	CSV	/data/general_finance/budget_allocations/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: general_operations; Owner: postgres
--

COPY general_operations."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	105	operational_metrics	CSV	CSV	/data/general_operations/operational_metrics/	account_type
2	106	system_logs	Parquet	JSON	/data/general_operations/system_logs/	account_type
3	107	performance_indicators	CSV	Parquet	/data/general_operations/performance_indicators/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: interest_rates; Owner: postgres
--

COPY interest_rates."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	36	interest_rates	Parquet	CSV	/data/interest_rates/interest_rates/	transaction_type
2	37	rate_tiers	Avro	Parquet	/data/interest_rates/rate_tiers/	region
3	38	rate_history	JSON	JSON	/data/interest_rates/rate_history/	transaction_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: investment_accounts; Owner: postgres
--

COPY investment_accounts."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	42	investment_accounts	JSON	Parquet	/data/investment_accounts/investment_accounts/	region
2	43	portfolio_holdings	CSV	CSV	/data/investment_accounts/portfolio_holdings/	transaction_type
3	44	investment_transactions	Parquet	CSV	/data/investment_accounts/investment_transactions/	account_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: investment_collateral; Owner: postgres
--

COPY investment_collateral."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	51	collateral_assets	JSON	JSON	/data/investment_collateral/collateral_assets/	account_type
2	52	collateral_valuations	JSON	Parquet	/data/investment_collateral/collateral_valuations/	region
3	53	margin_requirements	Parquet	CSV	/data/investment_collateral/margin_requirements/	date
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: investment_finance; Owner: postgres
--

COPY investment_finance."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	48	investment_performance	Avro	CSV	/data/investment_finance/investment_performance/	transaction_type
2	49	dividend_payments	Parquet	JSON	/data/investment_finance/dividend_payments/	account_type
3	50	capital_gains	CSV	CSV	/data/investment_finance/capital_gains/	account_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: investment_risk; Owner: postgres
--

COPY investment_risk."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	45	investment_risk_profiles	Parquet	JSON	/data/investment_risk/investment_risk_profiles/	region
2	46	market_risk_metrics	JSON	Parquet	/data/investment_risk/market_risk_metrics/	region
3	47	risk_tolerance	CSV	Parquet	/data/investment_risk/risk_tolerance/	date
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: loan_collections; Owner: postgres
--

COPY loan_collections."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	60	delinquent_accounts	CSV	Parquet	/data/loan_collections/delinquent_accounts/	account_type
2	61	collection_activities	Parquet	JSON	/data/loan_collections/collection_activities/	region
3	62	payment_arrangements	Parquet	JSON	/data/loan_collections/payment_arrangements/	transaction_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: loan_origination; Owner: postgres
--

COPY loan_origination."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	54	loan_applications	JSON	CSV	/data/loan_origination/loan_applications/	account_type
2	55	loan_approvals	Avro	JSON	/data/loan_origination/loan_approvals/	transaction_type
3	56	loan_documents	Avro	JSON	/data/loan_origination/loan_documents/	transaction_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: loan_risk_assessment; Owner: postgres
--

COPY loan_risk_assessment."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	57	credit_scores	JSON	Parquet	/data/loan_risk_assessment/credit_scores/	date
2	58	income_verification	CSV	JSON	/data/loan_risk_assessment/income_verification/	date
3	59	debt_to_income	Parquet	Parquet	/data/loan_risk_assessment/debt_to_income/	account_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: loan_servicing; Owner: postgres
--

COPY loan_servicing."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	63	loan_accounts	CSV	CSV	/data/loan_servicing/loan_accounts/	transaction_type
2	64	payment_schedules	CSV	Parquet	/data/loan_servicing/payment_schedules/	transaction_type
3	65	loan_modifications	JSON	JSON	/data/loan_servicing/loan_modifications/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: master_reference; Owner: postgres
--

COPY master_reference."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	108	lookup_tables	Parquet	Parquet	/data/master_reference/lookup_tables/	date
2	109	business_rules	Parquet	Parquet	/data/master_reference/business_rules/	region
3	110	configuration_settings	CSV	JSON	/data/master_reference/configuration_settings/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: merchant_services; Owner: postgres
--

COPY merchant_services."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	99	merchants	Parquet	JSON	/data/merchant_services/merchants/	date
2	100	merchant_transactions	CSV	Parquet	/data/merchant_services/merchant_transactions/	date
3	101	merchant_fees	JSON	Parquet	/data/merchant_services/merchant_fees/	date
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: mortgage_collateral; Owner: postgres
--

COPY mortgage_collateral."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	78	property_details	Parquet	JSON	/data/mortgage_collateral/property_details/	transaction_type
2	79	title_information	CSV	CSV	/data/mortgage_collateral/title_information/	account_type
3	80	insurance_policies	Parquet	CSV	/data/mortgage_collateral/insurance_policies/	transaction_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: mortgage_collections; Owner: postgres
--

COPY mortgage_collections."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	72	mortgage_delinquencies	CSV	CSV	/data/mortgage_collections/mortgage_delinquencies/	account_type
2	73	foreclosure_proceedings	Parquet	CSV	/data/mortgage_collections/foreclosure_proceedings/	transaction_type
3	74	loss_mitigation	CSV	Parquet	/data/mortgage_collections/loss_mitigation/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: mortgage_origination; Owner: postgres
--

COPY mortgage_origination."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	66	mortgage_applications	Avro	Parquet	/data/mortgage_origination/mortgage_applications/	account_type
2	67	property_appraisals	CSV	Parquet	/data/mortgage_origination/property_appraisals/	transaction_type
3	68	mortgage_approvals	Parquet	Parquet	/data/mortgage_origination/mortgage_approvals/	date
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: mortgage_risk; Owner: postgres
--

COPY mortgage_risk."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	69	mortgage_risk_scores	CSV	Parquet	/data/mortgage_risk/mortgage_risk_scores/	date
2	70	property_valuations	Parquet	CSV	/data/mortgage_risk/property_valuations/	region
3	71	loan_to_value_ratios	CSV	JSON	/data/mortgage_risk/loan_to_value_ratios/	date
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: mortgage_servicing; Owner: postgres
--

COPY mortgage_servicing."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	75	mortgage_accounts	JSON	CSV	/data/mortgage_servicing/mortgage_accounts/	account_type
2	76	escrow_accounts	JSON	Parquet	/data/mortgage_servicing/escrow_accounts/	transaction_type
3	77	mortgage_payments	CSV	Parquet	/data/mortgage_servicing/mortgage_payments/	account_type
\.


--
-- Data for Name: er_relationships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.er_relationships (id, database_name, from_table_id, from_column, to_table_id, to_column, cardinality, relationship_type, created_at) FROM stdin;
1	credit_card_promotions	1	promotion_id	2	promotion_id	one-to-many	foreign_key	2025-07-06 12:18:09
2	credit_card_promotions	1	promotion_id	3	promotion_id	one-to-many	foreign_key	2025-07-06 12:18:09
3	credit_card_accounts	4	credit_account_id	5	account_id	one-to-many	foreign_key	2025-07-06 12:18:09
4	credit_card_accounts	4	credit_account_id	6	account_id	one-to-many	foreign_key	2025-07-06 12:18:09
5	credit_card_accounts	4	credit_account_id	7	account_id	one-to-many	foreign_key	2025-07-06 12:18:09
6	card_payments	9	payment_method_id	8	payment_method_id	one-to-many	foreign_key	2025-07-06 12:18:09
7	card_payments	8	payment_transaction_id	10	payment_transaction_id	one-to-many	foreign_key	2025-07-06 12:18:09
8	card_fraud_detection	12	fraud_rule_id	11	fraud_rule_id	one-to-many	foreign_key	2025-07-06 12:18:09
9	card_fraud_detection	11	fraud_alert_id	13	fraud_alert_id	one-to-many	foreign_key	2025-07-06 12:18:09
10	card_disputes	14	dispute_case_id	15	dispute_case_id	one-to-many	foreign_key	2025-07-06 12:18:09
11	card_disputes	14	dispute_case_id	16	dispute_case_id	one-to-many	foreign_key	2025-07-06 12:18:09
12	customer_master	17	customer_id	18	customer_id	one-to-one	foreign_key	2025-07-06 12:18:09
13	customer_master	17	customer_id	19	customer_id	one-to-many	foreign_key	2025-07-06 12:18:09
14	customer_master	17	customer_id	20	customer_id	one-to-many	foreign_key	2025-07-06 12:18:09
15	regulatory_compliance	21	compliance_report_id	22	compliance_report_id	one-to-many	foreign_key	2025-07-06 12:18:09
16	regulatory_compliance	23	regulatory_filing_id	21	regulatory_filing_id	one-to-many	foreign_key	2025-07-06 12:18:09
17	credit_risk_mgmt	25	risk_model_id	24	risk_model_id	one-to-many	foreign_key	2025-07-06 12:18:09
18	credit_risk_mgmt	26	risk_assessment_id	24	risk_assessment_id	one-to-many	foreign_key	2025-07-06 12:18:09
19	deposit_accounts	30	deposit_account_id	31	deposit_account_id	one-to-one	foreign_key	2025-07-06 12:18:09
20	deposit_accounts	30	deposit_account_id	32	deposit_account_id	one-to-one	foreign_key	2025-07-06 12:18:09
21	interest_rates	36	interest_rate_id	37	interest_rate_id	one-to-many	foreign_key	2025-07-06 12:18:09
22	interest_rates	36	interest_rate_id	38	interest_rate_id	one-to-many	foreign_key	2025-07-06 12:18:09
23	deposit_fees	39	fee_schedule_id	40	fee_schedule_id	one-to-many	foreign_key	2025-07-06 12:18:09
24	deposit_fees	39	fee_schedule_id	41	fee_schedule_id	one-to-many	foreign_key	2025-07-06 12:18:09
25	investment_accounts	42	investment_account_id	43	investment_account_id	one-to-many	foreign_key	2025-07-06 12:18:09
26	investment_accounts	42	investment_account_id	44	investment_account_id	one-to-many	foreign_key	2025-07-06 12:18:09
27	investment_risk	45	investment_risk_profile_id	47	investment_risk_profile_id	one-to-many	foreign_key	2025-07-06 12:18:09
28	investment_collateral	51	collateral_asset_id	52	collateral_asset_id	one-to-many	foreign_key	2025-07-06 12:18:09
29	investment_collateral	51	collateral_asset_id	53	collateral_asset_id	one-to-many	foreign_key	2025-07-06 12:18:09
30	loan_origination	54	loan_application_id	55	loan_application_id	one-to-many	foreign_key	2025-07-06 12:18:09
31	loan_origination	54	loan_application_id	56	loan_application_id	one-to-many	foreign_key	2025-07-06 12:18:09
32	loan_collections	60	delinquent_account_id	61	delinquent_account_id	one-to-many	foreign_key	2025-07-06 12:18:09
33	loan_collections	60	delinquent_account_id	62	delinquent_account_id	one-to-many	foreign_key	2025-07-06 12:18:09
34	loan_servicing	63	loan_account_id	64	loan_account_id	one-to-many	foreign_key	2025-07-06 12:18:09
35	loan_servicing	63	loan_account_id	65	loan_account_id	one-to-many	foreign_key	2025-07-06 12:18:09
36	mortgage_origination	66	mortgage_application_id	67	mortgage_application_id	one-to-many	foreign_key	2025-07-06 12:18:09
37	mortgage_origination	66	mortgage_application_id	68	mortgage_application_id	one-to-many	foreign_key	2025-07-06 12:18:09
38	mortgage_collections	72	mortgage_delinquency_id	73	mortgage_delinquency_id	one-to-many	foreign_key	2025-07-06 12:18:09
39	mortgage_collections	72	mortgage_delinquency_id	74	mortgage_delinquency_id	one-to-many	foreign_key	2025-07-06 12:18:09
40	mortgage_servicing	75	mortgage_account_id	76	mortgage_account_id	one-to-many	foreign_key	2025-07-06 12:18:09
41	mortgage_servicing	75	mortgage_account_id	77	mortgage_account_id	one-to-many	foreign_key	2025-07-06 12:18:09
42	mortgage_collateral	78	property_detail_id	79	property_detail_id	one-to-many	foreign_key	2025-07-06 12:18:09
43	mortgage_collateral	78	property_detail_id	80	property_detail_id	one-to-many	foreign_key	2025-07-06 12:18:09
44	customer_profile	81	customer_profile_id	82	customer_profile_id	one-to-one	foreign_key	2025-07-06 12:18:09
45	customer_profile	81	customer_profile_id	83	customer_profile_id	one-to-many	foreign_key	2025-07-06 12:18:09
46	customer_communications	84	email_campaign_id	86	email_campaign_id	one-to-many	foreign_key	2025-07-06 12:18:09
47	customer_communications	85	sms_notification_id	86	sms_notification_id	one-to-many	foreign_key	2025-07-06 12:18:09
48	customer_complaints	87	complaint_case_id	88	complaint_case_id	one-to-many	foreign_key	2025-07-06 12:18:09
49	customer_complaints	89	complaint_category_id	87	complaint_category_id	one-to-many	foreign_key	2025-07-06 12:18:09
50	customer_marketing	90	marketing_campaign_id	92	marketing_campaign_id	one-to-many	foreign_key	2025-07-06 12:18:09
51	channel_management	93	channel_id	94	channel_id	one-to-many	foreign_key	2025-07-06 12:18:09
52	channel_management	93	channel_id	95	channel_id	one-to-many	foreign_key	2025-07-06 12:18:09
53	merchant_services	99	merchant_id	100	merchant_id	one-to-many	foreign_key	2025-07-06 12:18:09
54	merchant_services	99	merchant_id	101	merchant_id	one-to-many	foreign_key	2025-07-06 12:18:09
55	master_reference	108	lookup_table_id	109	lookup_table_id	one-to-many	foreign_key	2025-07-06 12:18:09
73	investment_accounts	42	JSON	44	Parquet	one-to-many	foreign_key	2025-07-06 01:34:20.391421
74	deposit_accounts	114	Avro	30	JSON	one-to-many	foreign_key	2025-07-06 10:23:03.644557
75	deposit_transactions	34	CSV	33	JSON	one-to-many	foreign_key	2025-07-06 10:30:19.199438
76	deposit_transactions	35	Parquet	33	JSON	one-to-many	foreign_key	2025-07-06 10:33:06.742951
77	mortgage_risk	69	CSV	70	CSV	one-to-many	foreign_key	2025-07-06 10:39:50.596676
78	mortgage_risk	71	CSV	69	CSV	one-to-many	foreign_key	2025-07-06 10:40:50.477711
79	reference_data	27	Avro	28	JSON	one-to-many	foreign_key	2025-07-06 10:43:22.379635
\.


--
-- Data for Name: lobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lobs (id, name) FROM stdin;
1	Branded cards
2	CRS
3	Deposits
4	Investments
5	Personal loan
6	Mortgage
7	Customer
8	Channel
9	Others
10	new
\.


--
-- Data for Name: logical_databases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logical_databases (id, name, subject_area_id) FROM stdin;
1	credit_card_promotions	1
2	credit_card_accounts	2
3	card_payments	3
4	card_fraud_detection	4
5	card_disputes	5
6	customer_master	6
7	regulatory_compliance	7
8	credit_risk_mgmt	8
9	reference_data	9
10	deposit_accounts	10
11	deposit_transactions	11
12	interest_rates	12
13	deposit_fees	13
14	investment_accounts	14
15	investment_risk	15
16	investment_finance	16
17	investment_collateral	17
18	loan_origination	18
19	loan_risk_assessment	19
20	loan_collections	20
21	loan_servicing	21
22	mortgage_origination	22
23	mortgage_risk	23
24	mortgage_collections	24
25	mortgage_servicing	25
26	mortgage_collateral	26
27	customer_profile	27
28	customer_communications	28
29	customer_complaints	29
30	customer_marketing	30
31	channel_management	31
32	channel_operations	32
33	merchant_services	33
34	general_finance	34
35	general_operations	35
36	master_reference	36
37	test_mortgage	26
38	invest_test	17
39	test	7
\.


--
-- Data for Name: subject_areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject_areas (id, name, lob_id) FROM stdin;
1	Account promotions	1
2	Accounts	1
3	Payments	1
4	Fraud	1
5	Disputes	1
6	Customer	2
7	Compliance	2
8	Risk	2
9	Reference	2
10	Accounts	3
11	Money movement	3
12	Rate	3
13	Fees	3
14	Accounts	4
15	Risk	4
16	Finance	4
17	Collateral	4
18	Acquisitions	5
19	Risk	5
20	Collections	5
21	Servicing	5
22	Acquisitions	6
23	Risk	6
24	Collections	6
25	Servicing	6
26	Collateral	6
27	Customer	7
28	Customer communication	7
29	Complaints	7
30	Marketing	7
31	Channels	8
32	Operations	8
33	Merchant	8
34	Finance	9
35	Operations	9
36	Reference	9
37	test	10
38	test	2
\.


--
-- Data for Name: tables_metadata; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tables_metadata (id, name, schema_name, database_id) FROM stdin;
1	promotions	credit_card_promotions	1
2	promotion_eligibility	credit_card_promotions	1
3	promotion_responses	credit_card_promotions	1
4	credit_accounts	credit_card_accounts	2
5	account_balances	credit_card_accounts	2
6	account_limits	credit_card_accounts	2
7	account_status	credit_card_accounts	2
8	payment_transactions	card_payments	3
9	payment_methods	card_payments	3
10	merchant_transactions	card_payments	3
11	fraud_alerts	card_fraud_detection	4
12	fraud_rules	card_fraud_detection	4
13	blocked_transactions	card_fraud_detection	4
14	dispute_cases	card_disputes	5
15	dispute_evidence	card_disputes	5
16	chargeback_requests	card_disputes	5
17	customers	customer_master	6
18	customer_demographics	customer_master	6
19	customer_addresses	customer_master	6
20	customer_contacts	customer_master	6
21	compliance_reports	regulatory_compliance	7
22	audit_logs	regulatory_compliance	7
23	regulatory_filings	regulatory_compliance	7
24	risk_scores	credit_risk_mgmt	8
25	risk_models	credit_risk_mgmt	8
26	risk_assessments	credit_risk_mgmt	8
27	country_codes	reference_data	9
28	currency_codes	reference_data	9
29	product_codes	reference_data	9
30	deposit_accounts	deposit_accounts	10
31	savings_accounts	deposit_accounts	10
32	checking_accounts	deposit_accounts	10
33	deposit_transactions	deposit_transactions	11
34	withdrawal_transactions	deposit_transactions	11
35	transfer_transactions	deposit_transactions	11
36	interest_rates	interest_rates	12
37	rate_tiers	interest_rates	12
38	rate_history	interest_rates	12
39	fee_schedules	deposit_fees	13
40	fee_transactions	deposit_fees	13
41	fee_waivers	deposit_fees	13
42	investment_accounts	investment_accounts	14
43	portfolio_holdings	investment_accounts	14
44	investment_transactions	investment_accounts	14
45	investment_risk_profiles	investment_risk	15
46	market_risk_metrics	investment_risk	15
47	risk_tolerance	investment_risk	15
48	investment_performance	investment_finance	16
49	dividend_payments	investment_finance	16
50	capital_gains	investment_finance	16
51	collateral_assets	investment_collateral	17
52	collateral_valuations	investment_collateral	17
53	margin_requirements	investment_collateral	17
54	loan_applications	loan_origination	18
55	loan_approvals	loan_origination	18
56	loan_documents	loan_origination	18
57	credit_scores	loan_risk_assessment	19
58	income_verification	loan_risk_assessment	19
59	debt_to_income	loan_risk_assessment	19
60	delinquent_accounts	loan_collections	20
61	collection_activities	loan_collections	20
62	payment_arrangements	loan_collections	20
63	loan_accounts	loan_servicing	21
64	payment_schedules	loan_servicing	21
65	loan_modifications	loan_servicing	21
66	mortgage_applications	mortgage_origination	22
67	property_appraisals	mortgage_origination	22
68	mortgage_approvals	mortgage_origination	22
69	mortgage_risk_scores	mortgage_risk	23
70	property_valuations	mortgage_risk	23
71	loan_to_value_ratios	mortgage_risk	23
72	mortgage_delinquencies	mortgage_collections	24
73	foreclosure_proceedings	mortgage_collections	24
74	loss_mitigation	mortgage_collections	24
75	mortgage_accounts	mortgage_servicing	25
76	escrow_accounts	mortgage_servicing	25
77	mortgage_payments	mortgage_servicing	25
78	property_details	mortgage_collateral	26
79	title_information	mortgage_collateral	26
80	insurance_policies	mortgage_collateral	26
81	customer_profiles	customer_profile	27
82	customer_preferences	customer_profile	27
83	customer_relationships	customer_profile	27
84	email_campaigns	customer_communications	28
85	sms_notifications	customer_communications	28
86	communication_logs	customer_communications	28
87	complaint_cases	customer_complaints	29
88	complaint_resolutions	customer_complaints	29
89	complaint_categories	customer_complaints	29
90	marketing_campaigns	customer_marketing	30
91	customer_segments	customer_marketing	30
92	campaign_responses	customer_marketing	30
93	channels	channel_management	31
94	channel_performance	channel_management	31
95	channel_costs	channel_management	31
96	atm_locations	channel_operations	32
97	branch_locations	channel_operations	32
98	online_sessions	channel_operations	32
99	merchants	merchant_services	33
100	merchant_transactions	merchant_services	33
101	merchant_fees	merchant_services	33
102	general_ledger	general_finance	34
103	financial_statements	general_finance	34
104	budget_allocations	general_finance	34
105	operational_metrics	general_operations	35
106	system_logs	general_operations	35
107	performance_indicators	general_operations	35
108	lookup_tables	master_reference	36
109	business_rules	master_reference	36
110	configuration_settings	master_reference	36
111	user	test_mortgage	26
112	sadas	test_mortgage	37
113	ta	test	39
114	tet	deposit_accounts	10
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: reference_data; Owner: postgres
--

COPY reference_data."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	27	country_codes	Avro	Parquet	/data/reference_data/country_codes/	region
2	28	currency_codes	Parquet	JSON	/data/reference_data/currency_codes/	region
3	29	product_codes	Avro	JSON	/data/reference_data/product_codes/	account_type
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: regulatory_compliance; Owner: postgres
--

COPY regulatory_compliance."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	21	compliance_reports	Parquet	JSON	/data/regulatory_compliance/compliance_reports/	date
2	22	audit_logs	JSON	JSON	/data/regulatory_compliance/audit_logs/	transaction_type
3	23	regulatory_filings	JSON	JSON	/data/regulatory_compliance/regulatory_filings/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: test; Owner: postgres
--

COPY test."table" (id, table_id, table_name, input_format, output_format, location, partitioned_by) FROM stdin;
1	113	ta	JSON	CSV	/data/test/ta/	region
\.


--
-- Data for Name: table; Type: TABLE DATA; Schema: test_mortgage; Owner: postgres
--

COPY test_mortgage."table" (id, input_format, output_format, location, partitioned_by) FROM stdin;
\.


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: card_disputes; Owner: postgres
--

SELECT pg_catalog.setval('card_disputes.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: card_fraud_detection; Owner: postgres
--

SELECT pg_catalog.setval('card_fraud_detection.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: card_payments; Owner: postgres
--

SELECT pg_catalog.setval('card_payments.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: channel_management; Owner: postgres
--

SELECT pg_catalog.setval('channel_management.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: channel_operations; Owner: postgres
--

SELECT pg_catalog.setval('channel_operations.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: credit_card_accounts; Owner: postgres
--

SELECT pg_catalog.setval('credit_card_accounts.table_id_seq', 4, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: credit_card_promotions; Owner: postgres
--

SELECT pg_catalog.setval('credit_card_promotions.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: credit_risk_mgmt; Owner: postgres
--

SELECT pg_catalog.setval('credit_risk_mgmt.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: customer_communications; Owner: postgres
--

SELECT pg_catalog.setval('customer_communications.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: customer_complaints; Owner: postgres
--

SELECT pg_catalog.setval('customer_complaints.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: customer_marketing; Owner: postgres
--

SELECT pg_catalog.setval('customer_marketing.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: customer_master; Owner: postgres
--

SELECT pg_catalog.setval('customer_master.table_id_seq', 4, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: customer_profile; Owner: postgres
--

SELECT pg_catalog.setval('customer_profile.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: deposit_accounts; Owner: postgres
--

SELECT pg_catalog.setval('deposit_accounts.table_id_seq', 4, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: deposit_fees; Owner: postgres
--

SELECT pg_catalog.setval('deposit_fees.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: deposit_transactions; Owner: postgres
--

SELECT pg_catalog.setval('deposit_transactions.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: general_finance; Owner: postgres
--

SELECT pg_catalog.setval('general_finance.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: general_operations; Owner: postgres
--

SELECT pg_catalog.setval('general_operations.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: interest_rates; Owner: postgres
--

SELECT pg_catalog.setval('interest_rates.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: investment_accounts; Owner: postgres
--

SELECT pg_catalog.setval('investment_accounts.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: investment_collateral; Owner: postgres
--

SELECT pg_catalog.setval('investment_collateral.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: investment_finance; Owner: postgres
--

SELECT pg_catalog.setval('investment_finance.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: investment_risk; Owner: postgres
--

SELECT pg_catalog.setval('investment_risk.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: loan_collections; Owner: postgres
--

SELECT pg_catalog.setval('loan_collections.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: loan_origination; Owner: postgres
--

SELECT pg_catalog.setval('loan_origination.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: loan_risk_assessment; Owner: postgres
--

SELECT pg_catalog.setval('loan_risk_assessment.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: loan_servicing; Owner: postgres
--

SELECT pg_catalog.setval('loan_servicing.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: master_reference; Owner: postgres
--

SELECT pg_catalog.setval('master_reference.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: merchant_services; Owner: postgres
--

SELECT pg_catalog.setval('merchant_services.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: mortgage_collateral; Owner: postgres
--

SELECT pg_catalog.setval('mortgage_collateral.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: mortgage_collections; Owner: postgres
--

SELECT pg_catalog.setval('mortgage_collections.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: mortgage_origination; Owner: postgres
--

SELECT pg_catalog.setval('mortgage_origination.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: mortgage_risk; Owner: postgres
--

SELECT pg_catalog.setval('mortgage_risk.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: mortgage_servicing; Owner: postgres
--

SELECT pg_catalog.setval('mortgage_servicing.table_id_seq', 3, true);


--
-- Name: er_relationships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.er_relationships_id_seq', 79, true);


--
-- Name: lobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lobs_id_seq', 10, true);


--
-- Name: logical_databases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logical_databases_id_seq', 39, true);


--
-- Name: subject_areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subject_areas_id_seq', 38, true);


--
-- Name: tables_metadata_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tables_metadata_id_seq', 114, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: reference_data; Owner: postgres
--

SELECT pg_catalog.setval('reference_data.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: regulatory_compliance; Owner: postgres
--

SELECT pg_catalog.setval('regulatory_compliance.table_id_seq', 3, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: test; Owner: postgres
--

SELECT pg_catalog.setval('test.table_id_seq', 1, true);


--
-- Name: table_id_seq; Type: SEQUENCE SET; Schema: test_mortgage; Owner: postgres
--

SELECT pg_catalog.setval('test_mortgage.table_id_seq', 1, false);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: card_disputes; Owner: postgres
--

ALTER TABLE ONLY card_disputes."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: card_fraud_detection; Owner: postgres
--

ALTER TABLE ONLY card_fraud_detection."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: card_payments; Owner: postgres
--

ALTER TABLE ONLY card_payments."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: channel_management; Owner: postgres
--

ALTER TABLE ONLY channel_management."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: channel_operations; Owner: postgres
--

ALTER TABLE ONLY channel_operations."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: credit_card_accounts; Owner: postgres
--

ALTER TABLE ONLY credit_card_accounts."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: credit_card_promotions; Owner: postgres
--

ALTER TABLE ONLY credit_card_promotions."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: credit_risk_mgmt; Owner: postgres
--

ALTER TABLE ONLY credit_risk_mgmt."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: customer_communications; Owner: postgres
--

ALTER TABLE ONLY customer_communications."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: customer_complaints; Owner: postgres
--

ALTER TABLE ONLY customer_complaints."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: customer_marketing; Owner: postgres
--

ALTER TABLE ONLY customer_marketing."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: customer_master; Owner: postgres
--

ALTER TABLE ONLY customer_master."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: customer_profile; Owner: postgres
--

ALTER TABLE ONLY customer_profile."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: deposit_accounts; Owner: postgres
--

ALTER TABLE ONLY deposit_accounts."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: deposit_fees; Owner: postgres
--

ALTER TABLE ONLY deposit_fees."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: deposit_transactions; Owner: postgres
--

ALTER TABLE ONLY deposit_transactions."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: general_finance; Owner: postgres
--

ALTER TABLE ONLY general_finance."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: general_operations; Owner: postgres
--

ALTER TABLE ONLY general_operations."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: interest_rates; Owner: postgres
--

ALTER TABLE ONLY interest_rates."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: investment_accounts; Owner: postgres
--

ALTER TABLE ONLY investment_accounts."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: investment_collateral; Owner: postgres
--

ALTER TABLE ONLY investment_collateral."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: investment_finance; Owner: postgres
--

ALTER TABLE ONLY investment_finance."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: investment_risk; Owner: postgres
--

ALTER TABLE ONLY investment_risk."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: loan_collections; Owner: postgres
--

ALTER TABLE ONLY loan_collections."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: loan_origination; Owner: postgres
--

ALTER TABLE ONLY loan_origination."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: loan_risk_assessment; Owner: postgres
--

ALTER TABLE ONLY loan_risk_assessment."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: loan_servicing; Owner: postgres
--

ALTER TABLE ONLY loan_servicing."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: master_reference; Owner: postgres
--

ALTER TABLE ONLY master_reference."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: merchant_services; Owner: postgres
--

ALTER TABLE ONLY merchant_services."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: mortgage_collateral; Owner: postgres
--

ALTER TABLE ONLY mortgage_collateral."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: mortgage_collections; Owner: postgres
--

ALTER TABLE ONLY mortgage_collections."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: mortgage_origination; Owner: postgres
--

ALTER TABLE ONLY mortgage_origination."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: mortgage_risk; Owner: postgres
--

ALTER TABLE ONLY mortgage_risk."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: mortgage_servicing; Owner: postgres
--

ALTER TABLE ONLY mortgage_servicing."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: er_relationships er_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.er_relationships
    ADD CONSTRAINT er_relationships_pkey PRIMARY KEY (id);


--
-- Name: lobs lobs_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lobs
    ADD CONSTRAINT lobs_name_key UNIQUE (name);


--
-- Name: lobs lobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lobs
    ADD CONSTRAINT lobs_pkey PRIMARY KEY (id);


--
-- Name: logical_databases logical_databases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logical_databases
    ADD CONSTRAINT logical_databases_pkey PRIMARY KEY (id);


--
-- Name: subject_areas subject_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_areas
    ADD CONSTRAINT subject_areas_pkey PRIMARY KEY (id);


--
-- Name: tables_metadata tables_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables_metadata
    ADD CONSTRAINT tables_metadata_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: regulatory_compliance; Owner: postgres
--

ALTER TABLE ONLY regulatory_compliance."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: table table_pkey; Type: CONSTRAINT; Schema: test_mortgage; Owner: postgres
--

ALTER TABLE ONLY test_mortgage."table"
    ADD CONSTRAINT table_pkey PRIMARY KEY (id);


--
-- Name: idx_er_relationships_database_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_er_relationships_database_name ON public.er_relationships USING btree (database_name);


--
-- Name: idx_er_relationships_from_table_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_er_relationships_from_table_id ON public.er_relationships USING btree (from_table_id);


--
-- Name: idx_er_relationships_to_table_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_er_relationships_to_table_id ON public.er_relationships USING btree (to_table_id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: card_disputes; Owner: postgres
--

ALTER TABLE ONLY card_disputes."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: card_fraud_detection; Owner: postgres
--

ALTER TABLE ONLY card_fraud_detection."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: card_payments; Owner: postgres
--

ALTER TABLE ONLY card_payments."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: channel_management; Owner: postgres
--

ALTER TABLE ONLY channel_management."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: channel_operations; Owner: postgres
--

ALTER TABLE ONLY channel_operations."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: credit_card_accounts; Owner: postgres
--

ALTER TABLE ONLY credit_card_accounts."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: credit_card_promotions; Owner: postgres
--

ALTER TABLE ONLY credit_card_promotions."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: credit_risk_mgmt; Owner: postgres
--

ALTER TABLE ONLY credit_risk_mgmt."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: customer_communications; Owner: postgres
--

ALTER TABLE ONLY customer_communications."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: customer_complaints; Owner: postgres
--

ALTER TABLE ONLY customer_complaints."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: customer_marketing; Owner: postgres
--

ALTER TABLE ONLY customer_marketing."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: customer_master; Owner: postgres
--

ALTER TABLE ONLY customer_master."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: customer_profile; Owner: postgres
--

ALTER TABLE ONLY customer_profile."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: deposit_accounts; Owner: postgres
--

ALTER TABLE ONLY deposit_accounts."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: deposit_fees; Owner: postgres
--

ALTER TABLE ONLY deposit_fees."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: deposit_transactions; Owner: postgres
--

ALTER TABLE ONLY deposit_transactions."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: general_finance; Owner: postgres
--

ALTER TABLE ONLY general_finance."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: general_operations; Owner: postgres
--

ALTER TABLE ONLY general_operations."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: interest_rates; Owner: postgres
--

ALTER TABLE ONLY interest_rates."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: investment_accounts; Owner: postgres
--

ALTER TABLE ONLY investment_accounts."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: investment_collateral; Owner: postgres
--

ALTER TABLE ONLY investment_collateral."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: investment_finance; Owner: postgres
--

ALTER TABLE ONLY investment_finance."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: investment_risk; Owner: postgres
--

ALTER TABLE ONLY investment_risk."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: loan_collections; Owner: postgres
--

ALTER TABLE ONLY loan_collections."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: loan_origination; Owner: postgres
--

ALTER TABLE ONLY loan_origination."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: loan_risk_assessment; Owner: postgres
--

ALTER TABLE ONLY loan_risk_assessment."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: loan_servicing; Owner: postgres
--

ALTER TABLE ONLY loan_servicing."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: master_reference; Owner: postgres
--

ALTER TABLE ONLY master_reference."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: merchant_services; Owner: postgres
--

ALTER TABLE ONLY merchant_services."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: mortgage_collateral; Owner: postgres
--

ALTER TABLE ONLY mortgage_collateral."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: mortgage_collections; Owner: postgres
--

ALTER TABLE ONLY mortgage_collections."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: mortgage_origination; Owner: postgres
--

ALTER TABLE ONLY mortgage_origination."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: mortgage_risk; Owner: postgres
--

ALTER TABLE ONLY mortgage_risk."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: mortgage_servicing; Owner: postgres
--

ALTER TABLE ONLY mortgage_servicing."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: er_relationships er_relationships_from_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.er_relationships
    ADD CONSTRAINT er_relationships_from_table_id_fkey FOREIGN KEY (from_table_id) REFERENCES public.tables_metadata(id) ON DELETE CASCADE;


--
-- Name: er_relationships er_relationships_to_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.er_relationships
    ADD CONSTRAINT er_relationships_to_table_id_fkey FOREIGN KEY (to_table_id) REFERENCES public.tables_metadata(id) ON DELETE CASCADE;


--
-- Name: logical_databases logical_databases_subject_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logical_databases
    ADD CONSTRAINT logical_databases_subject_area_id_fkey FOREIGN KEY (subject_area_id) REFERENCES public.subject_areas(id) ON DELETE CASCADE;


--
-- Name: subject_areas subject_areas_lob_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_areas
    ADD CONSTRAINT subject_areas_lob_id_fkey FOREIGN KEY (lob_id) REFERENCES public.lobs(id) ON DELETE CASCADE;


--
-- Name: tables_metadata tables_metadata_database_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables_metadata
    ADD CONSTRAINT tables_metadata_database_id_fkey FOREIGN KEY (database_id) REFERENCES public.logical_databases(id) ON DELETE CASCADE;


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: regulatory_compliance; Owner: postgres
--

ALTER TABLE ONLY regulatory_compliance."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- Name: table table_table_id_fkey; Type: FK CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test."table"
    ADD CONSTRAINT table_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables_metadata(id);


--
-- PostgreSQL database dump complete
--

