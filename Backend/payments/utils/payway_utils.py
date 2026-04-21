import hmac
import hashlib
import base64
import json
from django.conf import settings


class PayWayService:
    @staticmethod
    def get_hash(hash_str: str) -> str:
        """
        Generate HMAC-SHA512 hash as required by ABA PayWay.
        """
        key = settings.ABA_PAYWAY_API_KEY.encode('utf-8')
        message = hash_str.encode('utf-8')
        
        signature = hmac.new(key, message, hashlib.sha512).digest()
        return base64.b64encode(signature).decode('utf-8')

    @classmethod
    def generate_purchase_hash(cls, req_time, tran_id, amount, items, currency, 
                               return_url='', cancel_url='', firstname='', lastname='', 
                               email='', phone='', type='purchase', payment_option='', 
                               shipping='', continue_success_url='', return_deeplink='',
                               custom_fields='', return_params='', payout='', lifetime='',
                               additional_params='', google_pay_token='', skip_success_page=''):
        """
        Concatenator for the 24 fields in the exact order specified by ABA PayWay Docs.
        """
        fields = [
            req_time,
            settings.ABA_PAYWAY_MERCHANT_ID,
            tran_id,
            str(amount),
            items,
            shipping,
            firstname,
            lastname,
            email,
            phone,
            type,
            payment_option,
            return_url,
            cancel_url,
            continue_success_url,
            return_deeplink,
            currency,
            custom_fields,
            return_params,
            payout,
            lifetime,
            additional_params,
            google_pay_token,
            skip_success_page
        ]
        
        # Concatenate all fields. Note: Empty fields are just empty strings in the concatenation.
        raw_str = "".join([str(f) for f in fields])
        return cls.get_hash(raw_str)

    @classmethod
    def generate_check_transaction_hash(cls, req_time, tran_id):
        """
        Hash formula for status check: base64(hmac512(req_time + merchant_id + tran_id))
        """
        raw_str = f"{req_time}{settings.ABA_PAYWAY_MERCHANT_ID}{tran_id}"
        return cls.get_hash(raw_str)

    @staticmethod
    def encode_base64(data):
        if isinstance(data, (dict, list)):
            data = json.dumps(data)
        return base64.b64encode(data.encode('utf-8')).decode('utf-8')
