# Root

    export APP_NAME=iothub
    export ENV=env
    export OWNER=Jean-Vincent.Lamy
    export OWNER_EMAIL=jean-vincent.lamy-ext@solvay.com

    export SUBSCRIPTION_ID=fc54a208-6b3a-4c55-be9a-25348b9074d9
    export LOCATION=francecentral

    export TAGS=AppName="${APP_NAME} Environment=${ENV} Owner=${OWNER} OwnerEmail=${OWNER_EMAIL}"

    az login
    az account set --subscription $SUBSCRIPTION_ID

# Resource group

    export RESOURCE_GROUP=rg-frc-dt-infra-env-iothub-01

    az group create \
    --tags $TAGS \
    --name $RESOURCE_GROUP \
    --location $LOCATION

# Logs

    export LOG_ANALYTICS_WORKSPACE=logwksp-frc-dt-infra-env-iothub-01
    export APP_INSIGHTS=appins-frc-dt-infra-env-iothub-01

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

# Virtual Network

    export VNET_NAME=vnet-frc-dt-infra-env-iothub-01

    az network vnet create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --name $VNET_NAME \
    --location $LOCATION

# NSG

    export NSG_NAME=nsg-frc-dt-infra-env-iothub-01

    az network nsg create \
    --tags $TAGS \
    --resource-group $RESOURCE_GROUP \
    --name $NSG_NAME

    https://portal.azure.com

## Subnet private

    export PRIVATE_SUBNET_NAME=subnet-frc-dt-infra-env-iothub-private-01
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

    export INTEGRATION_SUBNET_NAME=subnet-frc-dt-infra-env-iothub-integration-01
    export INTEGRATION_SUBNET_PREFIX=10.0.1.0/24

    az network vnet subnet create \
    --resource-group $RESOURCE_GROUP \
    --vnet-name $VNET_NAME \
    --name $INTEGRATION_SUBNET_NAME \
    --address-prefixes $INTEGRATION_SUBNET_PREFIX \
    --network-security-group $NSG_NAME \
    --default-outbound-access false \
    --private-endpoint-network-policies Enabled \
    --delegations Microsoft.Web/serverFarms \
    --private-link-service-network-policies Enabled

## Subnet psql

    export PSQL_SUBNET_NAME=subnet-frc-dt-infra-env-iothub-psql-01
    export PSQL_SUBNET_PREFIX=10.0.2.0/24

    az network vnet subnet create \
    --resource-group $RESOURCE_GROUP \
    --vnet-name $VNET_NAME \
    --name $PSQL_SUBNET_NAME \
    --address-prefixes $PSQL_SUBNET_PREFIX \
    --network-security-group $NSG_NAME \
    --default-outbound-access false \
    --private-endpoint-network-policies Disabled \
    --delegations Microsoft.DBforPostgreSQL/flexibleServers \
    --private-link-service-network-policies Disabled

    # Service endpoint: Microsoft.Storage

# private DNS zones

    export PRIVATE_DNS_ZONE_AZUREWEBSITES=privatelink.azurewebsites.net
    export PRIVATE_DNS_ZONE_BLOBCORE=privatelink.blob.core.windows.net
    export PRIVATE_DNS_ZONE_POSTGRESDATABASE=privatelink.postgres.database.azure.com
    export PRIVATE_DNS_ZONE_REDIS=privatelink.redis.azure.net
    export PRIVATE_DNS_ZONE_SERVICEBUS=privatelink.servicebus.windows.net
    export PRIVATE_DNS_ZONE_VAULTCORE=privatelink.vaultcore.azure.net

    az network private-dns zone create \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_AZUREWEBSITES

    az network private-dns zone create \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_BLOBCORE

    az network private-dns zone create \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_POSTGRESDATABASE

    az network private-dns zone create \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_REDIS

    az network private-dns zone create \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_SERVICEBUS

    az network private-dns zone create \
    --resource-group $RESOURCE_GROUP \
    --name $PRIVATE_DNS_ZONE_VAULTCORE

# private DNS links

    export DNS_LINK_NAME_AZUREWEBSITES=vnetlink-frc-dt-infra-env-iothub-azurewebsites-01
    export DNS_LINK_NAME_BLOBCORE=vnetlink-frc-dt-infra-env-iothub-blobcore-01
    export DNS_LINK_NAME_POSTGRESDATABASE=vnetlink-frc-dt-infra-env-iothub-postgresdatabase-01
    export DNS_LINK_NAME_REDIS=vnetlink-frc-dt-infra-env-iothub-redis-01
    export DNS_LINK_NAME_SERVICEBUS=vnetlink-frc-dt-infra-env-iothub-servicebus-01
    export DNS_LINK_NAME_VAULTCORE=vnetlink-frc-dt-infra-env-iothub-vaultcore-01

    az network private-dns link vnet create \
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
    --resource-group $RESOURCE_GROUP \
    --zone-name $PRIVATE_DNS_ZONE_VAULTCORE \
    --name $DNS_LINK_NAME_VAULTCORE \
    --virtual-network $VNET_NAME \
    --registration-enabled false

# PostgreSQL Server

    export PG_SERVER_NAME=psqlflxsrv-frc-dt-infra-env-iothub-01
    export PG_DB_NAME=psql-frc-dt-infra-env-iothub-01
    export PG_ADMIN_USER=iothub
    export PG_ADMIN_PASSWORD='hGZP$JhL3Xpnydxl'

    az postgres flexible-server create \
    --tags $TAGS \
    --name $PG_SERVER_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --version 16 \
    --tier Burstable \
    --sku-name Standard_B1ms \
    --admin-user $PG_ADMIN_USER \
    --admin-password $PG_ADMIN_PASSWORD \
    --vnet $VNET_NAME \
    --subnet $PSQL_SUBNET_NAME \
    --private-dns-zone PRIVATE_DNS_ZONE_POSTGRESDATABASE

    az postgres flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $PG_SERVER_NAME \
    --database-name $PG_DB_NAME

# Storage account

    export STORAGE_ACCOUNT=storfrcdtenviothub01
    export STORAGE_ACCOUNT_PEP=storpep-frc-dt-infra-env-iothub-01
    export STORAGE_ACCOUNT_NIC=stornic-frc-dt-infra-env-iothub-01
    export STORAGE_ACCOUNT_CN=storcn-frc-dt-infra-env-iothub-01

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

# Storage account static website

    export STORAGE_ACCOUNT_WEB=storfrcdtenviothubweb01

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

    # az storage account network-rule add \
    # --resource-group $RESOURCE_GROUP \
    # --account-name $STORAGE_ACCOUNT_WEB \
    # --ip-address 88.176.75.82

    az storage blob service-properties update \
    --account-name $STORAGE_ACCOUNT_WEB \
    --static-website \
    --index-document index.html \
    --404-document index.html \
    --auth-mode login

# App function

    export FUNCTION_APP_CODEC=azfunction-frc-dt-infra-env-iothub-codec-01
    export FUNCTION_APP_CODEC_PEP=azfunctionpep-frc-dt-infra-env-iothub-codec-01
    export FUNCTION_APP_CODEC_NIC=azfunctionnic-frc-dt-infra-env-iothub-codec-01
    export FUNCTION_APP_CODEC_CN=azfunctioncn-frc-dt-infra-env-iothub-codec-01
    export FUNCTION_APP_CODEC_DSCN=azfunction-frc-dt-infra-env-iothub-codec-01

    az storage container create \
    --name $FUNCTION_APP_CODEC_DSCN \
    --account-name $STORAGE_ACCOUNT \
    --auth-mode login

    az functionapp create \
    --tags $TAGS \
    --name $FUNCTION_APP_CODEC \
    --resource-group $RESOURCE_GROUP \
    --storage-account $STORAGE_ACCOUNT \
    --deployment-storage-container-name $FUNCTION_APP_CODEC_DSCN \
    --functions-version 4 \
    --runtime node \
    --runtime-version 22 \
    --os-type Linux \
    --instance-memory 512 \
    --flexconsumption-location $LOCATION \
    --app-insights $APP_INSIGHTS

    # FUNC_ID=$(az functionapp show \
    # --resource-group $RESOURCE_GROUP \
    # --name $FUNCTION_APP_CODEC \
    # --query id -o tsv)

    # az network private-endpoint create \
    # --tags $TAGS \
    # --name $FUNCTION_APP_CODEC_PEP \
    # --resource-group $RESOURCE_GROUP \
    # --location $LOCATION \
    # --vnet-name $VNET_NAME \
    # --subnet $PRIVATE_SUBNET_NAME \
    # --private-connection-resource-id $FUNC_ID \
    # --group-id sites \
    # --nic-name $FUNCTION_APP_CODEC_NIC \
    # --connection-name $FUNCTION_APP_CODEC_CN

    # az network private-endpoint dns-zone-group create \
    # --resource-group $RESOURCE_GROUP \
    # --endpoint-name $FUNCTION_APP_CODEC_PEP \
    # --name website-dnszonegroup \
    # --private-dns-zone $PRIVATE_DNS_ZONE_AZUREWEBSITES \
    # --zone-name $PRIVATE_DNS_ZONE_AZUREWEBSITES

## Create VNet integration

    az functionapp vnet-integration add \
    --resource-group $RESOURCE_GROUP \
    --name $FUNCTION_APP_CODEC \
    --vnet $VNET_NAME \
    --subnet $INTEGRATION_SUBNET_NAME

## Disable public network access

    az functionapp config set \
    --resource-group $RESOURCE_GROUP \
    --name $FUNCTION_APP_CODEC \
    --generic-configurations "{\"ipSecurityRestrictionsDefaultAction\": \"Deny\"}"

    # az functionapp config set \
    # --resource-group $RESOURCE_GROUP \
    # --name $FUNCTION_APP_CODEC \
    # --generic-configurations "{\"scmIpSecurityRestrictionsDefaultAction\": \"Allow\"}"

## Allow specific IPs

    az functionapp config access-restriction add \
    --resource-group $RESOURCE_GROUP \
    --name $FUNCTION_APP_CODEC \
    --rule-name allowed-ip \
    --ip-address 88.176.75.82/32 \
    --action Allow \
    --priority 100

    # az functionapp config access-restriction add \
    # --resource-group $RESOURCE_GROUP \
    # --name $FUNCTION_APP_CODEC \
    # --rule-name allow-vnet \
    # --vnet-name $VNET_NAME \
    # --subnet $PRIVATE_SUBNET_NAME \
    # --action Allow \
    # --priority 200

    # az functionapp config show \
    # --resource-group $RESOURCE_GROUP \
    # --name $FUNCTION_APP_CODEC

## Allowed portal.azure.com

    az functionapp cors add \
    --name $FUNCTION_APP_CODEC \
    --resource-group $RESOURCE_GROUP \
    --allowed-origins https://portal.azure.com
