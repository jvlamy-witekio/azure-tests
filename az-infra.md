# Core

    export APP_NAME=iothub
    export ENV=sbx
    export OWNER="Jean-Vincent Lamy"
    export OWNER_EMAIL=jean-vincent.lamy-ext@solvay.com
    export LOCATION=francecentral
    export TAGS=\{\"AppName\":\"${APP_NAME}\",\"Environment\":\"${ENV}\",\"Owner\":\"${OWNER}\",\"OwnerEmail\":\"${OWNER_EMAIL}\"\}

## Witekio authentication

    export SUBSCRIPTION_ID=fc54a208-6b3a-4c55-be9a-25348b9074d9
    export RESOURCE_GROUP=rg-frc-dt-infra-${ENV}-iothub-01
    az login

## Solvay authentication

    export SUBSCRIPTION_ID=f445407f-df2a-4a88-9002-381c4230b444
    export RESOURCE_GROUP=RG-dt-infra-${ENV}-iothub-01
    az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID

# Subscription

    az account set --subscription $SUBSCRIPTION_ID

# Resource group

    az group create \
    --tags $TAGS \
    --name $RESOURCE_GROUP \
    --location $LOCATION

# Logs

    export LOG_ANALYTICS_WORKSPACE=logwksp-frc-dt-infra-${ENV}-iothub-01
    export APP_INSIGHTS=appins-frc-dt-infra-${ENV}-iothub-01

    az monitor log-analytics workspace create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --workspace-name $LOG_ANALYTICS_WORKSPACE \
    --location $LOCATION

    LAW_ID=$(az monitor log-analytics workspace show \
    --resource-group $RESOURCE_GROUP \
    --workspace-name $LOG_ANALYTICS_WORKSPACE \
    --query id -o tsv)

    az monitor app-insights component create \
    --tags $TAGS \
    --app $APP_INSIGHTS \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP \
    --workspace $LAW_ID

# NSG

    export NSG_NAME=nsg-frc-dt-infra-${ENV}-iothub-01

    az network nsg create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --name $NSG_NAME \
    --location $LOCATION

## NSG: Authorize intra-VNet traffic (TODO)

    # az network nsg rule create \
    # --resource-group rg-network \
    # --nsg-name nsg-shared \
    # --name Allow-VNet-Inbound \
    # --priority 100 \
    # --direction Inbound \
    # --access Allow \
    # --protocol "*" \
    # --source-address-prefix VirtualNetwork \
    # --destination-address-prefix VirtualNetwork \
    # --destination-port-range "*"

## NSG: Authorize Azure services traffic (TODO)

    # az network nsg rule create \
    # --resource-group rg-network \
    # --nsg-name nsg-shared \
    # --name Allow-Azure-Outbound \
    # --priority 100 \
    # --direction Outbound \
    # --access Allow \
    # --protocol "*" \
    # --destination-address-prefix AzureCloud \
    # --destination-port-range "*"

# NAT Gateway (TODO)

    # az network public-ip create \
    # --resource-group rg-network \
    # --name pip-nat-outbound \
    # --sku Standard \
    # --allocation-method Static

    # az network nat gateway create \
    # --resource-group rg-network \
    # --name nat-outbound \
    # --public-ip-addresses pip-nat-outbound \
    # --location westeurope

# VNet

    export VNET_NAME=vnet-frc-dt-infra-${ENV}-iothub-01

    az network vnet create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --name $VNET_NAME \
    --location $LOCATION

# Subnets

## Subnet private

    export PRIVATE_SUBNET_NAME=subnet-frc-dt-infra-${ENV}-iothub-private-01
    export PRIVATE_SUBNET_PREFIX=10.0.0.0/24

    az network vnet subnet create \
    --resource-group $RESOURCE_GROUP \
    --vnet-name $VNET_NAME \
    --name $PRIVATE_SUBNET_NAME \
    --address-prefixes $PRIVATE_SUBNET_PREFIX \
    --network-security-group $NSG_NAME \
    --default-outbound-access false \
    --private-endpoint-network-policies Disabled \
    --private-link-service-network-policies Enabled

## Subnet integration

    export INTEGRATION_SUBNET_NAME=subnet-frc-dt-infra-${ENV}-iothub-integration-01
    export INTEGRATION_SUBNET_PREFIX=10.0.1.0/24

    az network vnet subnet create \
    --resource-group $RESOURCE_GROUP \
    --vnet-name $VNET_NAME \
    --name $INTEGRATION_SUBNET_NAME \
    --address-prefixes $INTEGRATION_SUBNET_PREFIX \
    --network-security-group $NSG_NAME \
    --delegations Microsoft.Web/serverFarms \
    --default-outbound-access false \
    --private-endpoint-network-policies Enabled \
    --private-link-service-network-policies Enabled

## Subnet functions

    export FUNCTIONS_SUBNET_NAME=subnet-frc-dt-infra-${ENV}-iothub-functions-01
    export FUNCTIONS_SUBNET_PREFIX=10.0.2.0/24

    az network vnet subnet create \
    --resource-group $RESOURCE_GROUP \
    --vnet-name $VNET_NAME \
    --name $FUNCTIONS_SUBNET_NAME \
    --address-prefixes $FUNCTIONS_SUBNET_PREFIX \
    --network-security-group $NSG_NAME \
    --default-outbound-access false \
    --private-endpoint-network-policies Enabled \
    --private-link-service-network-policies Enabled

## Subnet psql

    export PSQL_SUBNET_NAME=subnet-frc-dt-infra-${ENV}-iothub-psql-01
    export PSQL_SUBNET_PREFIX=10.0.3.0/24

    az network vnet subnet create \
    --resource-group $RESOURCE_GROUP \
    --vnet-name $VNET_NAME \
    --name $PSQL_SUBNET_NAME \
    --address-prefixes $PSQL_SUBNET_PREFIX \
    --network-security-group $NSG_NAME \
    --delegations Microsoft.DBforPostgreSQL/flexibleServers \
    --default-outbound-access false \
    --private-endpoint-network-policies Enabled \
    --private-link-service-network-policies Enabled

# private DNS zones

    export PRIVATE_DNS_ZONE_AZUREWEBSITES=privatelink.azurewebsites.net
    export PRIVATE_DNS_ZONE_BLOBCORE=privatelink.blob.core.windows.net
    export PRIVATE_DNS_ZONE_POSTGRESDATABASE=privatelink.postgres.database.azure.com
    export PRIVATE_DNS_ZONE_REDIS=privatelink.redis.azure.net
    export PRIVATE_DNS_ZONE_SERVICEBUS=privatelink.servicebus.windows.net
    export PRIVATE_DNS_ZONE_VAULTCORE=privatelink.vaultcore.azure.net

    az network private-dns zone create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_AZUREWEBSITES

    az network private-dns zone create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_BLOBCORE

    az network private-dns zone create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_POSTGRESDATABASE

    az network private-dns zone create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_REDIS

    az network private-dns zone create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_SERVICEBUS

    az network private-dns zone create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_VAULTCORE

# private DNS links

    export DNS_LINK_NAME_AZUREWEBSITES=vnetlink-frc-dt-infra-${ENV}-iothub-azurewebsites-01
    export DNS_LINK_NAME_BLOBCORE=vnetlink-frc-dt-infra-${ENV}-iothub-blobcore-01
    export DNS_LINK_NAME_POSTGRESDATABASE=vnetlink-frc-dt-infra-${ENV}-iothub-postgresdatabase-01
    export DNS_LINK_NAME_REDIS=vnetlink-frc-dt-infra-${ENV}-iothub-redis-01
    export DNS_LINK_NAME_SERVICEBUS=vnetlink-frc-dt-infra-${ENV}-iothub-servicebus-01
    export DNS_LINK_NAME_VAULTCORE=vnetlink-frc-dt-infra-${ENV}-iothub-vaultcore-01

    az network private-dns link vnet create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --zone-name $PRIVATE_DNS_ZONE_AZUREWEBSITES \
    --name $DNS_LINK_NAME_AZUREWEBSITES \
    --virtual-network $VNET_NAME \
    --registration-enabled false

    az network private-dns link vnet create \
    --resource-group $RESOURCE_GROUP \
    --zone-name $PRIVATE_DNS_ZONE_BLOBCORE \
    --name $DNS_LINK_NAME_BLOBCORE \
    --virtual-network $VNET_NAME \
    --registration-enabled false

    az network private-dns link vnet create \
    --resource-group $RESOURCE_GROUP \
    --zone-name $PRIVATE_DNS_ZONE_POSTGRESDATABASE \
    --name $DNS_LINK_NAME_POSTGRESDATABASE \
    --virtual-network $VNET_NAME \
    --registration-enabled false

    az network private-dns link vnet create \
    --resource-group $RESOURCE_GROUP \
    --zone-name $PRIVATE_DNS_ZONE_REDIS \
    --name $DNS_LINK_NAME_REDIS \
    --virtual-network $VNET_NAME \
    --registration-enabled false

    az network private-dns link vnet create \
    --resource-group $RESOURCE_GROUP \
    --zone-name $PRIVATE_DNS_ZONE_SERVICEBUS \
    --name $DNS_LINK_NAME_SERVICEBUS \
    --virtual-network $VNET_NAME \
    --registration-enabled false

    az network private-dns link vnet create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --zone-name $PRIVATE_DNS_ZONE_VAULTCORE \
    --name $DNS_LINK_NAME_VAULTCORE \
    --virtual-network $VNET_NAME \
    --registration-enabled false

# Storage account static website

    export STORAGE_ACCOUNT_WEB=storfrcdt${ENV}iothubweb01

    az storage account create \
    --tags $TAGS \
    --name $STORAGE_ACCOUNT_WEB \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS \
    --kind StorageV2 \
    --https-only true \
    --allow-blob-public-access false \
    --min-tls-version TLS1_2

    az storage blob service-properties update \
    --account-name $STORAGE_ACCOUNT_WEB \
    --static-website \
    --index-document index.html \
    --404-document index.html \
    --auth-mode login

# Storage account

    export STORAGE_ACCOUNT=storfrcdt${ENV}iothub01
    export STORAGE_ACCOUNT_PEP=storpep-frc-dt-infra-${ENV}-iothub-01
    export STORAGE_ACCOUNT_NIC=stornic-frc-dt-infra-${ENV}-iothub-01
    export STORAGE_ACCOUNT_CN=storcn-frc-dt-infra-${ENV}-iothub-01

    az storage account create \
    --tags $TAGS \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS \
    --kind StorageV2 \
    --https-only true \
    --allow-blob-public-access true \
    --min-tls-version TLS1_2 \
    --default-action Deny \
    --allow-shared-key-access true

    AZA_ID=$(az storage account show \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --query id -o tsv)

    az network private-endpoint create \
    --tags $TAGS \
    --name $STORAGE_ACCOUNT_PEP \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --vnet-name $VNET_NAME \
    --subnet $PRIVATE_SUBNET_NAME \
    --private-connection-resource-id $AZA_ID \
    --group-id blob \
    --nic-name $STORAGE_ACCOUNT_NIC \
    --connection-name $STORAGE_ACCOUNT_CN

    az network private-endpoint dns-zone-group create \
    --resource-group $RESOURCE_GROUP \
    --endpoint-name $STORAGE_ACCOUNT_PEP \
    --name storage-dnszonegroup \
    --private-dns-zone $PRIVATE_DNS_ZONE_BLOBCORE \
    --zone-name $PRIVATE_DNS_ZONE_BLOBCORE

    az storage account network-rule add \
    --resource-group $RESOURCE_GROUP \
    --account-name $STORAGE_ACCOUNT \
    --ip-address 88.176.75.82

    az storage container create \
    --name assets \
    --account-name $STORAGE_ACCOUNT \
    --auth-mode login

# Event Hub Namespace

    export EVENT_HUB_NAMESPACE=evthubns-frc-dt-infra-${ENV}-iothub-01
    export EVENT_HUB_NAMESPACE_PEP=evthubnspep-frc-dt-infra-${ENV}-iothub-01
    export EVENT_HUB_NAMESPACE_NIC=evthubnsnic-frc-dt-infra-${ENV}-iothub-01
    export EVENT_HUB_NAMESPACE_CN=evthubnscn-frc-dt-infra-${ENV}-iothub-01

    az eventhubs namespace create \
    --tags $TAGS \
    --name $EVENT_HUB_NAMESPACE \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard \
    --enable-auto-inflate false \
    --capacity 1

    export EVENT_HUB_NAMESPACE_ID=$(az eventhubs namespace show \
    --name $EVENT_HUB_NAMESPACE \
    --resource-group $RESOURCE_GROUP \
    --query id \
    --output tsv)

    az network private-endpoint create \
    --tags $TAGS \
    --name $EVENT_HUB_NAMESPACE_PEP \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --vnet-name $VNET_NAME \
    --subnet $PRIVATE_SUBNET_NAME \
    --private-connection-resource-id $EVENT_HUB_NAMESPACE_ID \
    --group-id namespace \
    --nic-name $EVENT_HUB_NAMESPACE_NIC \
    --connection-name $EVENT_HUB_NAMESPACE_CN

    az network private-endpoint dns-zone-group create \
    --resource-group $RESOURCE_GROUP \
    --endpoint-name $EVENT_HUB_NAMESPACE_PEP \
    --name storage-dnszonegroup \
    --private-dns-zone $PRIVATE_DNS_ZONE_SERVICEBUS \
    --zone-name $PRIVATE_DNS_ZONE_SERVICEBUS

    az eventhubs namespace network-rule-set ip-rule add \
    --resource-group $RESOURCE_GROUP \
    --namespace-name $EVENT_HUB_NAMESPACE \
    --ip-rule ip-address=88.176.75.82 action=Allow

    az eventhubs namespace network-rule-set update \
    --resource-group $RESOURCE_GROUP \
    --namespace-name $EVENT_HUB_NAMESPACE \
    --default-action Deny

## Event Hub Codec

    export EVENT_HUB_CODEC=evthub-frc-dt-infra-${ENV}-iothub-codec-01

    az eventhubs eventhub create \
    --resource-group $RESOURCE_GROUP \
    --namespace-name $EVENT_HUB_NAMESPACE \
    --name $EVENT_HUB_CODEC \
    --cleanup-policy Delete \
    --partition-count 1 \
    --retention-time-in-hours 1

# App function

    FUNCTION_NAME=telem

    # codec
    # fcts
    # rout
    # mesexp
    # telem

    export FUNCTION_APP_NAME=azfunction-frc-dt-infra-${ENV}-iothub-${FUNCTION_NAME}-01
    export FUNCTION_APP_PEP=azfunctionpep-frc-dt-infra-${ENV}-iothub-${FUNCTION_NAME}-01
    export FUNCTION_APP_NIC=azfunctionnic-frc-dt-infra-${ENV}-iothub-${FUNCTION_NAME}-01
    export FUNCTION_APP_CN=azfunctioncn-frc-dt-infra-${ENV}-iothub-${FUNCTION_NAME}-01
    export FUNCTION_APP_DSCN=azfunction-frc-dt-infra-${ENV}-iothub-${FUNCTION_NAME}-01

    az storage container create \
    --name $FUNCTION_APP_DSCN \
    --account-name $STORAGE_ACCOUNT_WEB \
    --auth-mode login

    az functionapp create \
    --tags $TAGS \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --storage-account $STORAGE_ACCOUNT_WEB \
    --deployment-storage-container-name $FUNCTION_APP_DSCN \
    --functions-version 4 \
    --runtime node \
    --runtime-version 22 \
    --os-type Linux \
    --instance-memory 512 \
    --flexconsumption-location $LOCATION \
    --app-insights $APP_INSIGHTS

    # FUNC_ID=$(az functionapp show \
    # --resource-group $RESOURCE_GROUP \
    # --name $FUNCTION_APP_NAME \
    # --query id -o tsv)

    # az network private-endpoint create \
    # --tags $TAGS \
    # --name $FUNCTION_APP_PEP \
    # --resource-group $RESOURCE_GROUP \
    # --location $LOCATION \
    # --vnet-name $VNET_NAME \
    # --subnet $PRIVATE_SUBNET_NAME \
    # --private-connection-resource-id $FUNC_ID \
    # --group-id sites \
    # --nic-name $FUNCTION_APP_NIC \
    # --connection-name $FUNCTION_APP_CN

    # az network private-endpoint dns-zone-group create \
    # --resource-group $RESOURCE_GROUP \
    # --endpoint-name $FUNCTION_APP_PEP \
    # --name website-dnszonegroup \
    # --private-dns-zone $PRIVATE_DNS_ZONE_AZUREWEBSITES \
    # --zone-name $PRIVATE_DNS_ZONE_AZUREWEBSITES

## Create VNet integration

    az functionapp vnet-integration add \
    --resource-group $RESOURCE_GROUP \
    --name $FUNCTION_APP_NAME \
    --vnet $VNET_NAME \
    --subnet $INTEGRATION_SUBNET_NAME

## Disable public network access

    az functionapp config set \
    --resource-group $RESOURCE_GROUP \
    --name $FUNCTION_APP_NAME \
    --generic-configurations "{\"ipSecurityRestrictionsDefaultAction\": \"Deny\"}"

    # az functionapp config set \
    # --resource-group $RESOURCE_GROUP \
    # --name $FUNCTION_APP_NAME \
    # --generic-configurations "{\"scmIpSecurityRestrictionsDefaultAction\": \"Allow\"}"

## Allow specific IPs

    az functionapp config access-restriction add \
    --resource-group $RESOURCE_GROUP \
    --name $FUNCTION_APP_NAME \
    --rule-name allowed-ip \
    --ip-address 88.176.75.82/32 \
    --action Allow \
    --priority 100

    # az functionapp config access-restriction add \
    # --resource-group $RESOURCE_GROUP \
    # --name $FUNCTION_APP_NAME \
    # --rule-name allow-vnet \
    # --vnet-name $VNET_NAME \
    # --subnet $PRIVATE_SUBNET_NAME \
    # --action Allow \
    # --priority 200

    # az functionapp config show \
    # --resource-group $RESOURCE_GROUP \
    # --name $FUNCTION_APP_NAME

## Allowed portal.azure.com

    az functionapp cors add \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --allowed-origins https://portal.azure.com

## Enable system assigned managed identity

    az functionapp identity assign \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP

    PRINCIPAL_ID=$(az functionapp identity show \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query principalId \
    --output tsv)

    az role assignment create \
    --assignee $PRINCIPAL_ID \
    --role "Storage Blob Data Reader" \
    --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT

    az role assignment create \
    --assignee $PRINCIPAL_ID \
    --role "Azure Event Hubs Data Sender" \
    --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.EventHub/namespaces/$EVENT_HUB_NAMESPACE

    az role assignment create \
    --assignee $PRINCIPAL_ID \
    --role "Azure Event Hubs Data Receiver" \
    --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.EventHub/namespaces/$EVENT_HUB_NAMESPACE

# PostgresSQL Server

    export PG_SERVER_NAME=psqlflxsrv-frc-dt-infra-${ENV}-iothub-01
    export PG_ADMIN_USER=iothub
    export PG_ADMIN_PASSWORD='hGZP$JhL3Xpnydxl'
    export PG_DB_NAME=psql-frc-dt-infra-${ENV}-iothub-01

    az postgres flexible-server create \
    --tags $TAGS \
    --name $PG_SERVER_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --version 16 \
    --tier Burstable \
    --sku-name Standard_B1ms \
    --storage-size 32 \
    --admin-user $PG_ADMIN_USER \
    --admin-password $PG_ADMIN_PASSWORD \
    --vnet $VNET_NAME \
    --subnet $PSQL_SUBNET_NAME \
    --private-dns-zone $PRIVATE_DNS_ZONE_POSTGRESDATABASE

    az postgres flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $PG_SERVER_NAME \
    --database-name $PG_DB_NAME

# PostgresSQL Server Timescale

    export PG_SERVER_NAME_TIMESCALE=psqlflxsrv-frc-dt-infra-${ENV}-iothub-telemetries-01
    export PG_DB_NAME_TIMESCALE=psql-frc-dt-infra-${ENV}-iothub-telemetries-01

    az postgres flexible-server create \
    --tags $TAGS \
    --name $PG_SERVER_NAME_TIMESCALE \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --version 16 \
    --tier Burstable \
    --sku-name Standard_B1ms \
    --storage-size 32 \
    --admin-user $PG_ADMIN_USER \
    --admin-password $PG_ADMIN_PASSWORD \
    --vnet $VNET_NAME \
    --subnet $PSQL_SUBNET_NAME \
    --private-dns-zone $PRIVATE_DNS_ZONE_POSTGRESDATABASE

    az postgres flexible-server parameter set \
    --resource-group $RESOURCE_GROUP \
    --server-name $PG_SERVER_NAME_TIMESCALE \
    --name azure.extensions \
    --value timescaledb

    az postgres flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $PG_SERVER_NAME_TIMESCALE \
    --database-name $PG_DB_NAME_TIMESCALE

## PSQL

    # Add azure.extensions: CITEXT
    # Add azure.extensions: TIMESCALEDB
    # Add shared_preload_libraries: TIMESCALEDB

    # SQL: CREATE EXTENSION IF NOT EXISTS citext;
    # SQL: CREATE EXTENSION IF NOT EXISTS timescaledb;

## Adding environment variables

    az functionapp config appsettings set \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        STORAGE_ACCOUNT_NAME=$STORAGE_ACCOUNT \
        EVENT_HUB_CONNECTION__fullyQualifiedNamespace=${EVENT_HUB_NAMESPACE}.servicebus.windows.net \
        PGHOST=${PG_SERVER_NAME}.postgres.database.azure.com \
        PGDATABASE=$PG_DB_NAME_TIMESCALE \
        PGUSER=$PG_ADMIN_USER \
        PGPASSWORD=$PG_ADMIN_PASSWORD

# Event Hub Consumer groups

    az eventhubs eventhub consumer-group create \
    --resource-group $RESOURCE_GROUP \
    --namespace-name $EVENT_HUB_NAMESPACE \
    --eventhub-name $EVENT_HUB_CODEC \
    --name eventHubTrigger
