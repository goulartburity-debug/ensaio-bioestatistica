# lifelines 0.30.0, statistics.py
# Copyright (c) 2017 Cameron Davidson-Pilon. MIT License.
# Full license: ../../sample-size/licenses/lifelines-MIT.txt
import numpy as np
from scipy import stats

def sample_size_necessary_under_cph(power, ratio_of_participants, p_exp, p_con, postulated_hazard_ratio, alpha=0.05):
    """
    This computes the sample size for needed power to compare two groups under a Cox
    Proportional Hazard model.

    Parameters
    ----------

    power : float
        power to detect the magnitude of the hazard ratio as small as that specified by postulated_hazard_ratio.
    ratio_of_participants: ratio of participants in experimental group over control group.

    p_exp : float
        probability of failure in experimental group over period of study.

    p_con : float
        probability of failure in control group over period of study

    postulated_hazard_ratio : float
        the postulated hazard ratio

    alpha : float, optional (default=0.05)
        type I error rate


    Returns
    -------

    n_exp : integer
        the samples sizes need for the experiment to achieve desired power

    n_con : integer
        the samples sizes need for the control group to achieve desired power


    Examples
    --------
    .. code:: python

        from lifelines.statistics import sample_size_necessary_under_cph

        desired_power = 0.8
        ratio_of_participants = 1.
        p_exp = 0.25
        p_con = 0.35
        postulated_hazard_ratio = 0.7
        n_exp, n_con = sample_size_necessary_under_cph(desired_power, ratio_of_participants, p_exp, p_con, postulated_hazard_ratio)
        # (421, 421)

    References
    -----------
    https://cran.r-project.org/web/packages/powerSurvEpi/powerSurvEpi.pdf

    See Also
    --------
    power_under_cph
    """

    def z(p):
        return stats.norm.ppf(p)

    m = (
        1.0
        / ratio_of_participants
        * ((ratio_of_participants * postulated_hazard_ratio + 1.0) / (postulated_hazard_ratio - 1.0)) ** 2
        * (z(1.0 - alpha / 2.0) + z(power)) ** 2
    )

    n_exp = m * ratio_of_participants / (ratio_of_participants * p_exp + p_con)
    n_con = m / (ratio_of_participants * p_exp + p_con)

    return int(np.ceil(n_exp)), int(np.ceil(n_con))


def power_under_cph(n_exp, n_con, p_exp, p_con, postulated_hazard_ratio, alpha=0.05) -> float:
    """
    This computes the power of the hypothesis test that the two groups, experiment and control,
    have different hazards (that is, the relative hazard ratio is different from 1.)

    Parameters
    ----------

    n_exp : integer
        size of the experiment group.

    n_con : integer
        size of the control group.

    p_exp : float
        probability of failure in experimental group over period of study.

    p_con : float
        probability of failure in control group over period of study

    postulated_hazard_ratio : float
    the postulated hazard ratio

    alpha : float, optional (default=0.05)
        type I error rate

    Returns
    -------

    float:
        power to detect the magnitude of the hazard ratio as small as that specified by postulated_hazard_ratio.


    Notes
    -----
    `Reference <https://cran.r-project.org/web/packages/powerSurvEpi/powerSurvEpi.pdf>`_.


    See Also
    --------
    sample_size_necessary_under_cph
    """

    def z(p):
        return stats.norm.ppf(p)

    m = n_exp * p_exp + n_con * p_con
    k = float(n_exp) / float(n_con)
    return stats.norm.cdf(
        np.sqrt(k * m) * abs(postulated_hazard_ratio - 1) / (k * postulated_hazard_ratio + 1) - z(1 - alpha / 2.0)
    )


