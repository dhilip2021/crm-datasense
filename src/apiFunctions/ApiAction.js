import axios from 'axios'

import { AppHeader } from './AppHeader'

export const LoginApi = async body => {
  return await axios
    .post(`/api/v1/admin/sign_in`, body)
    .then(res => {
      return res.data
    })
    .catch(err => {
      return err
    })
}

export const userPrivilegeApi = async body => {
  return await axios
    .get(`/api/v1/admin/role/list`, {
      headers: AppHeader
    })
    .then(res => {
      return res.data
    })
    .catch(err => {
      return err
    })
}

export const craeteUserApi = async (body) => {
    return await axios
      .post(`/api/v1/admin/create_user`, body, {
        headers: AppHeader,
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err;
      });
  };

  export const allUserListApi = async (body, header) => {
    return await axios
      .post(`/api/v1/admin/list_user`, body, {
        headers: header,
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err;
      });
  };

// Leads model api's
  
export const createLead = async (body, header) => {
  
  return await axios.post(`/api/v1/admin/lead/add`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const postLeadListApi = async (body,header) => {
  return await axios
    .post(`/api/v1/admin/lead/list`, body, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getLeadListApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/lead/list?name=${body}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getAllLeadListApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/lead/list?orgId=${body}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getParticularLeadListApi = async (body,name) => {
  return await axios
    .get(`/api/v1/admin/lead/list?orgId=${body}&name=${name}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};



// Deal Model apis
export const postDealListApi = async (body) => {
  return await axios
    .post(`/api/v1/admin/deal/list`, body, { headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getDealListApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/deal/list?name=${body}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


// Field Models apis

export const addFieldApi = async (body, header) => {
  return await axios
    .post(`/api/v1/admin/field/add`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const postFieldListApi = async (body, header) => {
  return await axios
    .post(`/api/v1/admin/field/list`, body, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getFieldListApi = async (body,header) => {
  return await axios
    .get(`/api/v1/admin/field/list?id=${body}`,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

// Organization models apis
export const getOrganizationApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/organization/list?name=${body}`, { headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const addOrganizationApi = async (body) => {
  return await axios
    .post(`/api/v1/admin/organization/add`, body,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


export const checkMailApi = async (body) => {
  return await axios
    .post(`/api/v1/admin/check_email`, body)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const forgotPasswordApi = async (body) => {
  return await axios
    .post(`/api/v1/admin/forgot_password`, body)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


export const changePasswordApi = async (body, token) => {

  const AppHeaders ={
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
  
  return await axios
    .post(`/api/v1/admin/change_password`, body, {
      headers: AppHeaders 
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};